<?php

namespace App\Http\Middleware;

use App\Models\ApiKey;
use Closure;
use Illuminate\Http\Request;

class AuthenticateApiKey
{
    public function handle(Request $request, Closure $next)
    {
        $rawKey = $request->header('X-API-Key');

        if (!$rawKey) {
            return response()->json(['success' => false, 'error' => ['message' => 'API key required.']], 401);
        }

        $keyHash = hash('sha256', $rawKey);
        $apiKey  = ApiKey::with('tenant')
            ->where('key_hash', $keyHash)
            ->where('status', 'active')
            ->first();

        if (!$apiKey) {
            return response()->json(['success' => false, 'error' => ['message' => 'Invalid or revoked API key.']], 401);
        }

        $apiKey->update(['last_used_at' => now()]);

        $request->merge(['_api_key' => $apiKey, '_tenant' => $apiKey->tenant]);

        return $next($request);
    }
}
