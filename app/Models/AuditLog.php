<?php

namespace App\Models;

class AuditLog extends BaseModel
{
    protected $casts = [
        'before' => 'array',
        'after' => 'array',
    ];

    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_user_id');
    }
}
