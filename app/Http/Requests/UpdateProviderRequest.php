<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProviderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:100'],
            'role' => ['sometimes', 'required', 'in:primary,fallback'],
            'api_url' => ['sometimes', 'required', 'url'],
            'api_key_plain' => ['nullable', 'string'],
            'pricing_formula' => ['nullable', 'array'],
            'pricing_formula.unit' => ['required_with:pricing_formula', 'in:per_char,per_token,per_1m_token'],
            'pricing_formula.rate' => ['required_with:pricing_formula', 'numeric', 'min:0'],
            'is_active' => ['sometimes', 'required', 'boolean'],
            'config' => ['nullable', 'array'],
            'config.model' => ['nullable', 'string', 'max:150'],
        ];
    }
}
