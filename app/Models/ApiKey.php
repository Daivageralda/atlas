<?php

namespace App\Models;

class ApiKey extends BaseModel
{
    public const HASH_ALGO = 'sha256';
    public const KEY_REGEX = '/^ak_v1_[0-9A-HJKMNP-TV-Z]{26}\.[A-Za-z0-9_-]{43}$/';

    protected $guarded = ['id'];

    protected $casts = [
        'scopes'       => 'array',
        'expires_at'   => 'datetime',
        'revoked_at'   => 'datetime',
        'last_used_at' => 'datetime',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public static function hashSecret(string $secret): string
    {
        return hash(self::HASH_ALGO, $secret);
    }

    public function isLive(): bool
    {
        return $this->revoked_at === null && 
               ($this->expires_at === null || !$this->expires_at->isPast());
    }

    public static function generate(): array
    {
        $keyId = 'ak_v1_' . (string) \Illuminate\Support\Str::ulid();
        $secret = rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');
        
        return [
            'key_id'      => $keyId,
            'secret'      => $secret,
            'key_hash'    => self::hashSecret($secret),
            'key_preview' => \Illuminate\Support\Str::limit($keyId, 18, '...'),
            'raw'         => "{$keyId}.{$secret}",
        ];
    }
}
