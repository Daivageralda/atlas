<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ApiKeyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tenant_id' => $this->tenant_id,
            'label' => $this->label,
            'status' => $this->status,
            'scopes' => $this->scopes,
            'key_preview' => $this->key_preview,
            'last_used_at' => $this->last_used_at ? $this->last_used_at->toISOString() : null,
            'created_at' => $this->created_at ? $this->created_at->toISOString() : null,
        ];
    }
}
