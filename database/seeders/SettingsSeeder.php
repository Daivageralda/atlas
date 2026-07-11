<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            'supported_languages' => ['id', 'en', 'ja', 'zh', 'ar'],
            'global_prompt'       => 'Translate the following text accurately. Preserve formatting.',
            'retry_max_attempts'  => 3,
            'retry_backoff_ms'    => [1000, 2000, 4000],
        ];

        foreach ($defaults as $key => $value) {
            Setting::updateOrCreate(['key' => $key], ['value' => $value]);
        }
    }
}
