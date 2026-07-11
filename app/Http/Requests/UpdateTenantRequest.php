<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTenantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'min:2', 'max:100'],
            'type' => ['sometimes', 'nullable', 'string', 'max:100'],
            'status' => ['sometimes', 'required', 'in:active,inactive'],
        ];
    }
}
