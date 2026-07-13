<?php

namespace App\Models;

class TranslationLog extends BaseModel
{
    protected $guarded = [];
    protected $casts = [
        'fallback_used' => 'boolean',
        'request_payload' => 'array',
        'response_payload' => 'array',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function apiKey()
    {
        return $this->belongsTo(ApiKey::class, 'api_key_id');
    }
}
