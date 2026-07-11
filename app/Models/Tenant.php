<?php

namespace App\Models;

class Tenant extends BaseModel
{
    public function users()
    {
        return $this->hasMany(User::class, 'tenant_scope');
    }

    public function apiKeys()
    {
        return $this->hasMany(ApiKey::class);
    }

    public function translationMemory()
    {
        return $this->hasMany(TranslationMemory::class);
    }

    public function translationLogs()
    {
        return $this->hasMany(TranslationLog::class);
    }
}
