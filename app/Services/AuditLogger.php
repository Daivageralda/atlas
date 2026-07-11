<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class AuditLogger
{
    public static function log(Model $model, string $action, array $before = [], array $after = []): void
    {
        AuditLog::create([
            'actor_user_id' => Auth::id(),
            'entity_type'   => class_basename($model),
            'entity_id'     => (string) $model->getKey(),
            'action'        => $action,
            'before'        => $before ?: null,
            'after'         => $after ?: null,
        ]);
    }
}
