<?php

namespace Database\Seeders;

use App\Models\Provider;
use Illuminate\Database\Seeder;

class ProviderSeeder extends Seeder
{
    public function run(): void
    {
        // SumoPod — primary, active and configured
        Provider::create([
            'name'      => 'SumoPod',
            'role'      => 'primary',
            'api_url'   => env('SUMOPOD_BASE_URL', 'https://api.sumopod.test'),
            'api_key_encrypted' => encrypt(env('SUMOPOD_API_KEY', '')),
            'is_active' => true,
            'pricing_formula' => ['unit' => 'per_char', 'rate' => 0.0001],
            'config'    => ['model' => env('SUMOPOD_MODEL', 'gemini/gemini-3.1-flash-lite')],
        ]);

        // Public Translation API — fallback
        Provider::create([
            'name'      => 'Public Translation API',
            'role'      => 'fallback',
            'api_url'   => env('PUBLIC_TRANSLATION_API_URL', 'https://api.public.test'),
            'is_active' => false,
        ]);
    }
}
