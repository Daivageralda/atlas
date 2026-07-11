<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class MemoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tenant_name' => $this->tenant ? $this->tenant->name : 'Unknown Tenant',
            'cache_key' => Str::limit($this->cache_key, 12, '...'),
            'source_lang' => $this->source_lang,
            'target_lang' => $this->target_lang,
            'content_type' => $this->content_type,
            'source_text' => Str::limit($this->source_text, 80, '...'),
            'translated_text' => Str::limit($this->translated_text, 80, '...'),
            'source_text_full' => $this->source_text,
            'translated_text_full' => $this->translated_text,
            'provider' => $this->provider ?? '—',
            'usage_count' => $this->usage_count,
            'updated_at' => $this->updated_at ? $this->updated_at->toISOString() : null,
        ];
    }
}
