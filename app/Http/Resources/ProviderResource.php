<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProviderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'role' => $this->role,
            'api_url' => $this->api_url,
            'pricing_formula' => $this->pricing_formula,
            'is_active' => (bool) $this->is_active,
            'config' => $this->config,
            'created_at' => $this->created_at ? $this->created_at->toISOString() : null,
        ];
    }
}
