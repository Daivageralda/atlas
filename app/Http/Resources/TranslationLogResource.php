<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TranslationLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tenant_name' => $this->tenant ? $this->tenant->name : 'Unknown Tenant',
            'status' => $this->status,
            'provider' => $this->provider ?? '—',
            'content_type' => $this->content_type,
            'source_lang' => $this->source_lang,
            'target_lang' => $this->target_lang,
            'retry_count' => $this->retry_count,
            'fallback_used' => (bool) $this->fallback_used,
            'duration_ms' => $this->duration_ms,
            'estimated_cost' => (float) $this->estimated_cost,
            'cached' => $this->status === 'cached',
            'created_at' => $this->created_at ? $this->created_at->toISOString() : null,
        ];
    }
}
