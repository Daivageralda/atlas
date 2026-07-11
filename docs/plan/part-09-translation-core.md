# Part 09 — Translation Core API

> **Status**: `[ ]`
> **Depends on**: Part 01 (translation_memory, translation_logs, queue_jobs tables), Part 07 (API keys), Part 08 (providers)
> **Blocks**: Part 10 (logs need real data), Part 11 (TM entries), Part 12 (queue jobs)

---

## Goal

The heart of Atlas. `POST /api/v1/translate` — the single endpoint all external apps call. Handles:
1. API key auth (middleware from Part 02)
2. Request validation
3. Translation Memory lookup (cache hit → return immediately)
4. Provider dispatch to SumoPod (primary)
5. Retry with exponential backoff on failure
6. Fallback to Public Translation API
7. Save result to Translation Memory
8. Write `translation_logs` row
9. Return structured response

All synchronous in V1. QStash used in Part 12 for future async jobs.

---

## REST Endpoint

```
POST /api/v1/translate
Header: X-API-Key: atl_live_xxx
Content-Type: application/json
```

### Request Body

```json
{
    "content_type": "html",
    "source_lang": "id",
    "target_lang": "en",
    "text": "<p>Selamat datang.</p>"
}
```

Validation rules:
- `content_type`: required|in:plain,html,markdown
- `source_lang`: required|string|size:2 (ISO 639-1, explicit — no auto-detect in V1)
- `target_lang`: required|string|size:2
- `text`: required|string|max:50000

### Response

```json
{
    "success": true,
    "data": {
        "translation_id": "01j2abc...",
        "translated_text": "<p>Welcome.</p>",
        "cached": false,
        "provider": "sumopod",
        "retry_count": 0,
        "fallback_used": false,
        "duration_ms": 842,
        "estimated_cost": 0.0012
    },
    "error": null
}
```

---

## Backend

### `TranslateController` (`app/Http/Controllers/Api/TranslateController.php`)

```php
public function translate(TranslateRequest $request): JsonResponse
{
    $startTime = microtime(true);

    $tenant = $request->_tenant;
    $apiKey = $request->_api_key;

    $cacheKey = $this->buildCacheKey(
        $tenant->id,
        $request->source_lang,
        $request->target_lang,
        $request->content_type,
        $request->text
    );

    // 1. Translation Memory lookup
    $cached = TranslationMemory::where('tenant_id', $tenant->id)
        ->where('cache_key', $cacheKey)
        ->first();

    if ($cached) {
        $cached->increment('usage_count');
        return $this->logAndReturn($tenant, $apiKey, $request, [
            'translation_id'  => \Illuminate\Support\Str::ulid(),
            'translated_text' => $cached->translated_text,
            'cached'          => true,
            'provider'        => $cached->provider,
            'retry_count'     => 0,
            'fallback_used'   => false,
            'duration_ms'     => (int) ((microtime(true) - $startTime) * 1000),
            'estimated_cost'  => 0,
        ], 'cached');
    }

    // 2. Dispatch to provider
    $result = $this->dispatch($request->content_type, $request->text, $request->source_lang, $request->target_lang);

    // 3. Store in Translation Memory
    TranslationMemory::create([
        'tenant_id'      => $tenant->id,
        'cache_key'      => $cacheKey,
        'source_lang'    => $request->source_lang,
        'target_lang'    => $request->target_lang,
        'content_type'   => $request->content_type,
        'source_text'    => $request->text,
        'translated_text'=> $result['translated_text'],
        'provider'       => $result['provider'],
    ]);

    $result['duration_ms']    = (int) ((microtime(true) - $startTime) * 1000);
    $result['translation_id'] = \Illuminate\Support\Str::ulid();

    return $this->logAndReturn($tenant, $apiKey, $request, $result, 'success');
}

private function buildCacheKey(int $tenantId, string $src, string $tgt, string $type, string $text): string
{
    return hash('sha256', implode('|', [$tenantId, $src, $tgt, $type, $text]));
}
```

### `TranslationDispatcher` Service (`app/Services/TranslationDispatcher.php`)

Handles provider dispatch, retry, fallback:

```php
public function dispatch(string $contentType, string $text, string $src, string $tgt): array
{
    $primary  = Provider::where('role', 'primary')->where('is_active', true)->first();
    $fallback = Provider::where('role', 'fallback')->where('is_active', true)->first();

    $retryCount   = 0;
    $fallbackUsed = false;
    $settings     = Setting::where('key', 'retry_max_attempts')->first()?->value ?? 3;
    $backoff      = Setting::where('key', 'retry_backoff_ms')->first()?->value ?? [1000, 2000, 4000];

    // Try primary with retry
    if ($primary) {
        for ($attempt = 0; $attempt < $settings; $attempt++) {
            try {
                $translated = $this->callProvider($primary, $contentType, $text, $src, $tgt);
                $cost = $this->estimateCost($primary, $text);
                return [
                    'translated_text' => $translated,
                    'provider'        => $primary->name,
                    'retry_count'     => $retryCount,
                    'fallback_used'   => false,
                    'estimated_cost'  => $cost,
                ];
            } catch (\Exception $e) {
                $retryCount++;
                if ($attempt < $settings - 1) {
                    usleep(($backoff[$attempt] ?? 4000) * 1000);
                }
            }
        }
    }

    // Fallback
    if ($fallback) {
        try {
            $translated = $this->callProvider($fallback, $contentType, $text, $src, $tgt);
            return [
                'translated_text' => $translated,
                'provider'        => $fallback->name,
                'retry_count'     => $retryCount,
                'fallback_used'   => true,
                'estimated_cost'  => $this->estimateCost($fallback, $text),
            ];
        } catch (\Exception $e) {
            throw new \RuntimeException('All providers failed: ' . $e->getMessage());
        }
    }

    throw new \RuntimeException('No active provider available.');
}

private function callProvider(Provider $provider, string $contentType, string $text, string $src, string $tgt): string
{
    // HTTP call to provider API
    // For HTML/Markdown: pre-process to extract text nodes, translate, re-inject
    $response = Http::withToken(decrypt($provider->api_key_encrypted))
        ->timeout(15)
        ->post($provider->api_url, [
            'source_lang'  => $src,
            'target_lang'  => $tgt,
            'content_type' => $contentType,
            'text'         => $text,
        ]);

    if (!$response->successful()) {
        throw new \RuntimeException("Provider error: {$response->status()}");
    }

    return $response->json('translated_text') ?? throw new \RuntimeException('Empty translation response.');
}

private function estimateCost(Provider $provider, string $text): float
{
    $formula = $provider->pricing_formula;
    if (!$formula) return 0;

    return match($formula['unit'] ?? '') {
        'per_char'  => strlen($text) * ($formula['rate'] ?? 0),
        'per_token' => (int)(strlen($text) / 4) * ($formula['rate'] ?? 0), // rough token estimate
        default     => 0,
    };
}
```

### `logAndReturn()` helper

Writes `translation_logs` row, then calls `$this->success($data)` from `ApiResponse`.

```php
private function logAndReturn(Tenant $tenant, ApiKey $apiKey, $request, array $result, string $status): JsonResponse
{
    TranslationLog::create([
        'id'              => $result['translation_id'],
        'tenant_id'       => $tenant->id,
        'api_key_id'      => $apiKey->id,
        'source_lang'     => $request->source_lang,
        'target_lang'     => $request->target_lang,
        'content_type'    => $request->content_type,
        'status'          => $status,
        'provider'        => $result['provider'] ?? null,
        'retry_count'     => $result['retry_count'],
        'fallback_used'   => $result['fallback_used'],
        'duration_ms'     => $result['duration_ms'],
        'estimated_cost'  => $result['estimated_cost'],
        'request_payload' => ['text_length' => strlen($request->text)], // don't store raw text in log
    ]);

    return $this->success($result);
}
```

---

## Error Handling

| Scenario | Response |
|---|---|
| Invalid/revoked API key | 401 — from `AuthenticateApiKey` middleware |
| Validation failed | 422 — Laravel validation |
| All providers fail | 502 — "Translation service temporarily unavailable." |
| No active provider | 503 — "No translation provider configured." |
| Rate limit exceeded | 429 — (implement in Part 02 via `ThrottleRequests` middleware) |

---

## HTML / Markdown Handling

- **Plain**: translate directly.
- **HTML**: use PHP `DOMDocument` to walk text nodes, translate each, re-assemble. Tags/attributes untouched.
- **Markdown**: regex to identify translatable segments (not code blocks, not syntax markers), translate, re-inject.

> Extract into `App\Services\TextExtractor` — one method per content type.

---

## Verification

- [ ] `POST /api/v1/translate` with valid key + plain text → 200 with `translated_text`.
- [ ] Response includes: `translation_id, cached, provider, retry_count, fallback_used, duration_ms, estimated_cost`.
- [ ] Second identical request → `cached: true`, same `translated_text`, `duration_ms` very short.
- [ ] Primary provider failure → retries 3x → falls back → `fallback_used: true`.
- [ ] Both providers fail → 502 with error message.
- [ ] No active provider → 503.
- [ ] `translation_logs` row written for every request (cache hit + miss).
- [ ] `translation_memory` row created on cache miss, `usage_count` incremented on cache hit.
- [ ] HTML translation: `<p>`, `<a>` tags preserved. Only text nodes translated.
- [ ] Missing `source_lang` → 422 validation error.
- [ ] `request_payload` in log does NOT store the raw text content.
