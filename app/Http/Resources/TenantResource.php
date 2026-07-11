<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TenantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'type' => $this->type,
            'status' => $this->status,
            'api_keys_count' => $this->api_keys_count ?? $this->apiKeys()->count(),
            'created_at' => $this->created_at ? $this->created_at->toISOString() : null,
        ];
    }
}
