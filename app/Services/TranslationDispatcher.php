<?php

namespace App\Services;

use App\Models\Provider;
use App\Models\Setting;
use Illuminate\Support\Facades\Http;

class TranslationDispatcher
{
    protected $textExtractor;
    private int $accumulatedTokens = 0;

    public function __construct(TextExtractor $textExtractor)
    {
        $this->textExtractor = $textExtractor;
    }

    public function dispatch(string $contentType, string $text, string $src, string $tgt): array
    {
        $this->accumulatedTokens = 0; // Reset token counter on start

        $primary = Provider::where('role', 'primary')->where('is_active', 1)->first();
        $fallback = Provider::where('role', 'fallback')->where('is_active', 1)->first();

        $retryCount = 0;
        $fallbackUsed = false;
        
        $maxAttempts = (int) (Setting::where('key', 'retry_max_attempts')->first()?->value ?? 3);
        $backoffConfig = Setting::where('key', 'retry_backoff_ms')->first()?->value ?? [1000, 2000, 4000];

        // Ensure backoff config parameters are parsed correctly
        if (is_string($backoffConfig)) {
            $backoffConfig = json_decode($backoffConfig, true) ?? [1000, 2000, 4000];
        }

        $lastException = null;

        // Try primary engine
        if ($primary) {
            for ($attempt = 0; $attempt < $maxAttempts; $attempt++) {
                try {
                    $translated = $this->textExtractor->extractAndTranslate($contentType, $text, function ($segment) use ($primary, $src, $tgt, $contentType) {
                        return $this->callProvider($primary, $contentType, $segment, $src, $tgt);
                    });

                    return [
                        'translated_text' => $translated,
                        'provider' => $primary->name,
                        'retry_count' => $retryCount,
                        'fallback_used' => false,
                        'estimated_cost' => $this->estimateCost($primary, $text, $this->accumulatedTokens),
                        'token_usage' => $this->accumulatedTokens,
                    ];
                } catch (\Exception $e) {
                    $lastException = $e;
                    $retryCount++;
                    if ($attempt < $maxAttempts - 1) {
                        $delayMs = $backoffConfig[$attempt] ?? 4000;
                        usleep($delayMs * 1000);
                    }
                }
            }
        }

        // Try fallback engine if primary failed or does not exist
        if ($fallback) {
            try {
                $translated = $this->textExtractor->extractAndTranslate($contentType, $text, function ($segment) use ($fallback, $src, $tgt, $contentType) {
                    return $this->callProvider($fallback, $contentType, $segment, $src, $tgt);
                });

                return [
                    'translated_text' => $translated,
                    'provider' => $fallback->name,
                    'retry_count' => $retryCount,
                    'fallback_used' => true,
                    'estimated_cost' => $this->estimateCost($fallback, $text, $this->accumulatedTokens),
                    'token_usage' => $this->accumulatedTokens,
                ];
            } catch (\Exception $e) {
                throw new \RuntimeException('All translation engines failed: ' . $e->getMessage());
            }
        }

        $primaryCount = Provider::where('role', 'primary')->count();
        $fallbackCount = Provider::where('role', 'fallback')->count();
        $allCount = Provider::count();

        throw new \RuntimeException("No active provider. DB state: PrimaryCount={$primaryCount}, FallbackCount={$fallbackCount}, AllCount={$allCount}. Query: role=primary, is_active=1. Primary failed attempts count: {$retryCount}. Last error: " . ($lastException ? $lastException->getMessage() : 'None'));
    }

    private function callProvider(Provider $provider, string $contentType, string $text, string $src, string $tgt): string
    {
        $apiKey = decrypt($provider->api_key_encrypted);
        $baseUrl = rtrim($provider->api_url, '/');
        
        // Read model name from DB config or fallback to Geminis default
        $config = $provider->config;
        if (is_string($config)) {
            $config = json_decode($config, true);
        }
        $model = $config['model'] ?? 'gemini/gemini-3.1-flash-lite';

        // Fetch dynamic system prompt from settings or use professional default
        $systemInstruction = \App\Models\Setting::where('key', 'global_prompt')->value('value')
            ?? "Anda adalah Asisten Penerjemah Profesional. Terjemahkan teks Bahasa Sumber ({src}) berikut ke bahasa target dengan kode locale '{tgt}'. Kembalikan HANYA teks hasil terjemahannya saja tanpa tanda kutip pembuka/penutup, tanpa penjelasan pembuka, dan tanpa format tambahan apa pun. Jaga nada dan gaya bahasa agar tetap natural dan profesional.";

        $instruction = str_replace(['{src}', '{tgt}'], [$src, $tgt], $systemInstruction);

        if (strpos($systemInstruction, '{src}') === false && strpos($systemInstruction, '{tgt}') === false) {
            $instruction .= "\nSource Language: {$src}\nTarget Language: {$tgt}";
        }

        $prompt = "{$instruction}\n\nOriginal Text:\n\"\"\"\n{$text}\n\"\"\"";

        $response = Http::withHeaders([
            'Authorization' => "Bearer {$apiKey}",
            'Content-Type' => 'application/json'
        ])
        ->timeout(30)
        ->post("{$baseUrl}/chat/completions", [
            'model' => $model,
            'messages' => [
                ['role' => 'user', 'content' => $prompt]
            ],
            'temperature' => 0.3,
        ]);

        if (!$response->successful()) {
            throw new \RuntimeException("Provider error: {$response->status()} - " . $response->body());
        }

        $translatedText = $response->json('choices.0.message.content') 
            ?? throw new \RuntimeException('Empty chat completion translation response.');
            
        $tokens = (int) $response->json('usage.total_tokens');
        if ($tokens <= 0) {
            // Rough fallback calculation (1 token ~ 4 characters)
            $tokens = (int) (strlen($text) / 4);
        }

        $this->accumulatedTokens += $tokens;

        return $translatedText;
    }

    private function estimateCost(Provider $provider, string $text, int $tokens = 0): float
    {
        $formula = $provider->pricing_formula;
        if (is_string($formula)) {
            $formula = json_decode($formula, true);
        }
        
        if (empty($formula)) {
            return 0.0;
        }

        $unit = $formula['unit'] ?? 'per_token';
        $rate = (float) ($formula['rate'] ?? 0.0);

        return match ($unit) {
            'per_char' => strlen($text) * $rate,
            'per_token' => ($tokens > 0 ? $tokens : (int) (strlen($text) / 4)) * $rate,
            'per_1m_token' => (($tokens > 0 ? $tokens : (int) (strlen($text) / 4)) / 1000000.0) * $rate,
            default => 0.0,
        };
    }
}
