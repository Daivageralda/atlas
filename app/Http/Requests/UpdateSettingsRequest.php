<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'supported_languages'   => ['sometimes', 'array', 'min:1'],
            'supported_languages.*' => ['string', 'size:2'], // ISO 639-1 format
            'global_prompt'         => ['sometimes', 'nullable', 'string', 'max:2000'],
            'retry_max_attempts'    => ['sometimes', 'integer', 'min:1', 'max:10'],
            'retry_backoff_ms'      => ['sometimes', 'array'],
            'retry_backoff_ms.*'    => ['integer', 'min:100', 'max:30000'],
        ];
    }
}
