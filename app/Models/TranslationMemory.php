<?php

namespace App\Models;

class TranslationMemory extends BaseModel
{
    protected $table = 'translation_memory';

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}
