<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\TranslateRequest;
use App\Models\ApiKey;
use App\Models\Tenant;
use App\Models\TranslationLog;
use App\Models\TranslationMemory;
use App\Services\TranslationDispatcher;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class TranslateController extends Controller
{
    use ApiResponse;

    protected $dispatcher;

    public function __construct(TranslationDispatcher $dispatcher)
    {
        $this->dispatcher = $dispatcher;
    }

    public function translate(TranslateRequest $request): JsonResponse
    {
        $startTime = microtime(true);

        // Fetch auth context verified from AuthenticateApiKey middleware
        $tenant = $request->get('_tenant') ?? $request->route()->parameter('_tenant') ?? $request->input('_tenant') ?? $request->attributes->get('_tenant');
        $apiKey = $request->get('_api_key') ?? $request->route()->parameter('_api_key') ?? $request->input('_api_key') ?? $request->attributes->get('_api_key');

        if (!$tenant || !$apiKey) {
            // Fallback: reload context manually from header key
            $rawKey = $request->header('X-API-Key');
            if ($rawKey) {
                $keyHash = hash('sha256', $rawKey);
                $apiKey = \App\Models\ApiKey::where('key_hash', $keyHash)->first();
                $tenant = $apiKey ? $apiKey->tenant : null;
            }
        }

        if (!$tenant || !$apiKey) {
            return $this->error('Unauthorized API Key credentials.', 401);
        }

        // Translation Memory Caching check
        $cacheKey = $this->buildCacheKey(
            $tenant->id,
            $request->source_lang,
            $request->target_lang,
            $request->content_type,
            $request->text
        );

        $cached = TranslationMemory::where('tenant_id', $tenant->id)
            ->where('cache_key', $cacheKey)
            ->first();

        if ($cached) {
            $cached->increment('usage_count');
            
            $durationMs = (int) ((microtime(true) - $startTime) * 1000);
            
            return $this->logAndReturn($tenant, $apiKey, $request, [
                'translation_id' => Str::ulid()->toBase32(),
                'translated_text' => $cached->translated_text,
                'cached' => true,
                'provider' => $cached->provider,
                'retry_count' => 0,
                'fallback_used' => false,
                'duration_ms' => $durationMs,
                'estimated_cost' => 0.000000,
            ], 'cached');
        }

        // Call Engine Provider
        try {
            $result = $this->dispatcher->dispatch(
                $request->content_type,
                $request->text,
                $request->source_lang,
                $request->target_lang
            );
        } catch (\Exception $e) {
            // Write failure details into logs
            $durationMs = (int) ((microtime(true) - $startTime) * 1000);
            $this->writeLog($tenant, $apiKey, $request, [
                'translation_id' => Str::ulid()->toBase32(),
                'provider' => null,
                'retry_count' => 3,
                'fallback_used' => true,
                'duration_ms' => $durationMs,
                'estimated_cost' => 0.000000,
            ], 'failed');

            return $this->error('Translation service temporarily unavailable: ' . $e->getMessage(), 502);
        }

        // Save result cache to Translation Memory
        TranslationMemory::create([
            'tenant_id' => $tenant->id,
            'cache_key' => $cacheKey,
            'source_lang' => $request->source_lang,
            'target_lang' => $request->target_lang,
            'content_type' => $request->content_type,
            'source_text' => $request->text,
            'translated_text' => $result['translated_text'],
            'provider' => $result['provider'],
        ]);

        $result['duration_ms'] = (int) ((microtime(true) - $startTime) * 1000);
        $result['translation_id'] = Str::ulid()->toBase32();
        $result['cached'] = false;

        return $this->logAndReturn($tenant, $apiKey, $request, $result, 'success');
    }

    private function buildCacheKey(int $tenantId, string $src, string $tgt, string $type, string $text): string
    {
        return hash('sha256', implode('|', [$tenantId, $src, $tgt, $type, $text]));
    }

    private function logAndReturn(Tenant $tenant, ApiKey $apiKey, TranslateRequest $request, array $result, string $status): JsonResponse
    {
        $this->writeLog($tenant, $apiKey, $request, $result, $status);
        return $this->success($result);
    }

    private function writeLog(Tenant $tenant, ApiKey $apiKey, TranslateRequest $request, array $result, string $status): void
    {
        TranslationLog::create([
            'id' => $result['translation_id'],
            'tenant_id' => $tenant->id,
            'api_key_id' => $apiKey->id,
            'source_lang' => $request->source_lang,
            'target_lang' => $request->target_lang,
            'content_type' => $request->content_type,
            'status' => $status,
            'provider' => $result['provider'] ?? null,
            'retry_count' => $result['retry_count'] ?? 0,
            'fallback_used' => (bool) ($result['fallback_used'] ?? false),
            'duration_ms' => $result['duration_ms'] ?? 0,
            'cost_estimate' => (float) ($result['estimated_cost'] ?? 0.000000),
            'token_usage' => (int) ($result['token_usage'] ?? 0),
            'request_payload' => ['text_length' => strlen($request->text)], // exclude raw text
        ]);
    }
}
