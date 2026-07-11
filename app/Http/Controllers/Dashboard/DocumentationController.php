<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Inertia\Inertia;
use Inertia\Response;

class DocumentationController extends Controller
{
    public function index(): Response
    {
        $dbSettings = Setting::all()->pluck('value', 'key');

        $supportedLanguages = $dbSettings['supported_languages'] ?? ['id', 'en', 'ja', 'zh', 'ar'];
        if (is_string($supportedLanguages)) {
            $supportedLanguages = json_decode($supportedLanguages, true) ?? ['id', 'en', 'ja', 'zh', 'ar'];
        }

        return Inertia::render('Docs/Index', [
            'supportedLanguages' => $supportedLanguages,
            'baseUrl'            => rtrim(config('app.url'), '/'),
        ]);
    }
}
