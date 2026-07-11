<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isAdmin();
    }

    public function rules(): array
    {
        $userId = $this->route('user')?->id;

        return [
            'name'         => ['sometimes', 'required', 'string', 'max:255'],
            'role'         => ['sometimes', 'required', 'in:admin,developer'],
            'tenant_scope' => ['required_if:role,developer', 'nullable', 'exists:tenants,id'],
            'status'       => ['sometimes', 'required', 'in:active,inactive'],
        ];
    }
}
