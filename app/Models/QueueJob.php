<?php

namespace App\Models;

class QueueJob extends BaseModel
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $guarded = [];

    protected $casts = [
        'payload' => 'array',
    ];
}
