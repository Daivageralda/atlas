<?php

namespace App\Models;

class ApiKey extends BaseModel
{
    protected $casts = [
        'scopes' => 'array',
        'last_used_at' => 'datetime',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}
