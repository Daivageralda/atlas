<?php

use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // Tenant-facing endpoints (requires valid API Key via AuthenticateApiKey middleware)
    Route::middleware('auth.api_key')->group(function () {
        Route::post('translate', ['App\Http\Controllers\Api\TranslateController', 'translate']);
        Route::get('translate/{id}', ['App\Http\Controllers\Api\TranslateController', 'show']);
        Route::get('languages', ['App\Http\Controllers\Api\LanguageController', 'index']);
    });

    // Upstash QStash webhook endpoint (externally signed)
    Route::post('queue/callback', ['App\Http\Controllers\Queue\QueueCallbackController', 'handle']);
});
