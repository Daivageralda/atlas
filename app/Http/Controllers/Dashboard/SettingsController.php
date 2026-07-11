<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateSettingsRequest;
use App\Models\Setting;
use App\Services\AuditLogger;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function index(): Response
    {
        if (!auth()->user()->isAdmin()) {
            abort(403, 'Unauthorized access to settings panel.');
        }

        $dbSettings = Setting::all()->pluck('value', 'key');

        $supportedLanguages = $dbSettings['supported_languages'] ?? ['id', 'en', 'ja', 'zh', 'ar'];
        if (is_string($supportedLanguages)) {
            $supportedLanguages = json_decode($supportedLanguages, true) ?? ['id', 'en', 'ja', 'zh', 'ar'];
        }

        $retryBackoffMs = $dbSettings['retry_backoff_ms'] ?? [1000, 2000, 4000];
        if (is_string($retryBackoffMs)) {
            $retryBackoffMs = json_decode($retryBackoffMs, true) ?? [1000, 2000, 4000];
        }

        return Inertia::render('Settings/Index', [
            'settings' => [
                'supported_languages' => $supportedLanguages,
                'global_prompt'       => $dbSettings['global_prompt'] ?? '',
                'retry_max_attempts'  => (int) ($dbSettings['retry_max_attempts'] ?? 3),
                'retry_backoff_ms'    => $retryBackoffMs,
            ],
        ]);
    }

    public function update(UpdateSettingsRequest $request)
    {
        $validated = $request->validated();

        foreach ($validated as $key => $value) {
            $dbRow = Setting::where('key', $key)->first();
            $before = $dbRow ? $dbRow->value : null;

            // Serialize array structures
            $valueToStore = is_array($value) ? json_encode($value) : $value;
            if (is_array($before)) {
                $before = json_encode($before);
            }

            $setting = Setting::updateOrCreate(['key' => $key], ['value' => $valueToStore]);

            AuditLogger::log(
                $setting,
                'updated',
                [$key => $before],
                [$key => $valueToStore]
            );
        }

        return back()->with('success', 'Pengaturan global sistem disimpan.');
    }
}
