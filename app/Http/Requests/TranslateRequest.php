<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TranslateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'content_type' => ['required', 'in:plain,html,markdown'],
            'source_lang' => ['required', 'string', 'size:2'],
            'target_lang' => ['required', 'string', 'size:2'],
            'text' => ['required', 'string', 'max:50000'],
        ];
    }
}
