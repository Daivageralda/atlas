<?php

namespace App\Models;

class QueueJob extends BaseModel
{
    protected $guarded = [];

    protected $casts = [
        'payload' => 'array',
    ];
}
