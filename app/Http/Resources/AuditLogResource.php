<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class AuditLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'actor_name' => $this->actor ? $this->actor->name : 'System (System)',
            'actor_email' => $this->actor ? $this->actor->email : 'system@atlas.test',
            'entity_type' => class_basename($this->entity_type),
            'entity_id' => Str::limit($this->entity_id, 12, '...'),
            'entity_id_full' => $this->entity_id,
            'action' => $this->action,
            'before' => is_string($this->before) ? json_decode($this->before, true) : $this->before,
            'after' => is_string($this->after) ? json_decode($this->after, true) : $this->after,
            'created_at' => $this->created_at ? $this->created_at->toISOString() : null,
        ];
    }
}
