<?php

namespace App\Models;

class Provider extends BaseModel
{
    protected $casts = [
        'pricing_formula' => 'array',
        'is_active' => 'boolean',
        'config' => 'array',
    ];
}
