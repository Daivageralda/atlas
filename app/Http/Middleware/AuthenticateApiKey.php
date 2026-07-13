<?php

namespace App\Http\Middleware;

use App\Models\ApiKey;
use Closure;
use Illuminate\Http\Request;

class AuthenticateApiKey
{
    protected ?ApiKey $apiKey = null;

    public function handle(Request $request, Closure $next)
    {
        $rawKey = $request->header('X-API-Key');

        if (!$rawKey && $request->hasHeader('Authorization')) {
            $authHeader = $request->header('Authorization');
            if (preg_match('/^Bearer\s+(.+)$/i', $authHeader, $matches)) {
                $rawKey = $matches[1];
            }
        }

        if (!$rawKey) {
            return response()->json(['success' => false, 'error' => ['message' => 'API key required.']], 401);
        }

        if (!preg_match(ApiKey::KEY_REGEX, $rawKey)) {
            return response()->json(['success' => false, 'error' => ['message' => 'Invalid API key format.']], 401);
        }

        [$keyId, $secret] = explode('.', $rawKey, 2);

        $apiKey = ApiKey::with('tenant')
            ->where('key_id', $keyId)
            ->first();

        if (!$apiKey || !$apiKey->isLive() || !hash_equals($apiKey->key_hash, ApiKey::hashSecret($secret))) {
            return response()->json(['success' => false, 'error' => ['message' => 'Invalid or revoked API key.']], 401);
        }

        $this->apiKey = $apiKey;

        $request->merge(['_api_key' => $apiKey, '_tenant' => $apiKey->tenant]);

        return $next($request);
    }

    public function terminate(Request $request, $response)
    {
        if ($this->apiKey) {
            $this->apiKey->update(['last_used_at' => now()]);
        }
    }
}
