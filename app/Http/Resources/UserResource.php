<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'tenant_scope' => $this->tenant_scope,
            'tenant_scope_name' => $this->scopedTenant ? $this->scopedTenant->name : 'All',
            'status' => $this->status,
            'created_at' => $this->created_at ? $this->created_at->toISOString() : null,
        ];
    }
}
