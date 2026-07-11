# Part 01 — Migrations & Seeders

> **Status**: `[ ]`
> **Depends on**: Part 00 (Laravel installed, DB configured in `.env`)
> **Blocks**: Part 02+ (everything needs tables)

---

## Goal

Create all database tables via Laravel migrations in correct dependency order. Seed the minimum data needed to develop and test: an admin user, default providers, default settings.

---

## Migration Order (dependency-safe)

```
1. users
2. tenants
3. api_keys            → tenants
4. providers
5. translation_memory  → tenants
6. translation_logs    → tenants, api_keys
7. queue_jobs
8. audit_logs          → users (nullable)
9. settings
```

---

## Migrations

### `users`

```php
Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('email')->unique();
    $table->string('password');
    $table->enum('role', ['admin', 'developer'])->default('developer');
    $table->foreignId('tenant_scope')->nullable()->constrained('tenants')->nullOnDelete();
    $table->enum('status', ['active', 'inactive'])->default('active');
    $table->rememberToken();
    $table->timestamps();
});
```

> **Note**: `tenant_scope` FK added via a second migration after `tenants` table exists. Or: create tenants first, users second (swap order if needed).

### `tenants`

```php
Schema::create('tenants', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('type')->nullable(); // free text: News Portal, Company Profile, etc.
    $table->enum('status', ['active', 'inactive'])->default('active');
    $table->timestamps();
});
```

### `api_keys`

```php
Schema::create('api_keys', function (Blueprint $table) {
    $table->id();
    $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
    $table->string('label');
    $table->string('key_hash', 64)->unique(); // SHA-256 hex
    $table->json('scopes')->nullable();
    $table->enum('status', ['active', 'revoked'])->default('active');
    $table->timestamp('last_used_at')->nullable();
    $table->timestamps();
});
```

### `providers`

```php
Schema::create('providers', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->enum('role', ['primary', 'fallback']);
    $table->string('api_url');
    $table->text('api_key_encrypted')->nullable(); // encrypted via Laravel encrypt()
    $table->json('pricing_formula')->nullable();   // { unit: 'per_char'|'per_token', rate: 0.0001 }
    $table->boolean('is_active')->default(false);
    $table->json('config')->nullable();
    $table->timestamps();
});
```

### `translation_memory`

```php
Schema::create('translation_memory', function (Blueprint $table) {
    $table->id();
    $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
    $table->string('cache_key', 128);
    $table->string('source_lang', 10);
    $table->string('target_lang', 10);
    $table->enum('content_type', ['plain', 'html', 'markdown']);
    $table->longText('source_text');
    $table->longText('translated_text');
    $table->string('provider')->nullable();
    $table->unsignedInteger('usage_count')->default(1);
    $table->timestamps();

    $table->index(['tenant_id', 'cache_key']);
    $table->unique(['tenant_id', 'cache_key']); // one result per tenant+key
});
```

### `translation_logs`

```php
Schema::create('translation_logs', function (Blueprint $table) {
    $table->ulid('id')->primary();
    $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
    $table->foreignId('api_key_id')->nullable()->constrained('api_keys')->nullOnDelete();
    $table->string('source_lang', 10);
    $table->string('target_lang', 10);
    $table->enum('content_type', ['plain', 'html', 'markdown']);
    $table->enum('status', ['success', 'failed', 'cached']);
    $table->string('provider')->nullable();
    $table->tinyInteger('retry_count')->default(0);
    $table->boolean('fallback_used')->default(false);
    $table->unsignedInteger('duration_ms')->nullable();
    $table->unsignedInteger('token_usage')->nullable();
    $table->decimal('cost_estimate', 10, 6)->nullable();
    $table->json('request_payload')->nullable();
    $table->json('response_payload')->nullable();
    $table->text('error_message')->nullable();
    $table->timestamps();

    $table->index(['tenant_id', 'created_at']);
    $table->index(['status']);
});
```

### `queue_jobs`

```php
Schema::create('queue_jobs', function (Blueprint $table) {
    $table->ulid('id')->primary();
    $table->string('type');
    $table->json('payload');
    $table->enum('status', ['pending', 'running', 'success', 'failed'])->default('pending');
    $table->tinyInteger('retry_count')->default(0);
    $table->string('qstash_message_id')->nullable();
    $table->text('error')->nullable();
    $table->timestamps();

    $table->index(['status']);
});
```

### `audit_logs`

```php
Schema::create('audit_logs', function (Blueprint $table) {
    $table->id();
    $table->foreignId('actor_user_id')->nullable()->constrained('users')->nullOnDelete();
    $table->string('entity_type');   // 'Tenant', 'ApiKey', 'Provider', 'User', 'Settings', etc.
    $table->string('entity_id');     // polymorphic — string to accommodate ULIDs too
    $table->enum('action', ['created', 'updated', 'deleted']);
    $table->json('before')->nullable();
    $table->json('after')->nullable();
    $table->timestamps();

    $table->index(['entity_type', 'entity_id']);
    $table->index(['actor_user_id']);
});
```

### `settings`

```php
Schema::create('settings', function (Blueprint $table) {
    $table->id();
    $table->string('key')->unique();
    $table->json('value');
    $table->timestamps();
});
```

---

## Base Model (`app/Models/BaseModel.php`)

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BaseModel extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }
}
```

All models extend `BaseModel`, not `Model` directly.

---

## Seeders

### `DatabaseSeeder`
```php
$this->call([
    UserSeeder::class,
    ProviderSeeder::class,
    SettingsSeeder::class,
]);
```

### `UserSeeder`
```php
User::create([
    'name'     => 'Admin Atlas',
    'email'    => 'admin@atlas.test',
    'password' => Hash::make('password'),
    'role'     => 'admin',
    'status'   => 'active',
]);
```

### `ProviderSeeder`
```php
// SumoPod — primary, inactive until configured
Provider::create([
    'name'      => 'SumoPod',
    'role'      => 'primary',
    'api_url'   => env('SUMOPOD_API_URL', ''),
    'is_active' => false,
    'pricing_formula' => ['unit' => 'per_char', 'rate' => 0.0001],
]);

// Public Translation API — fallback
Provider::create([
    'name'      => 'Public Translation API',
    'role'      => 'fallback',
    'api_url'   => env('PUBLIC_TRANSLATION_API_URL', ''),
    'is_active' => false,
]);
```

### `SettingsSeeder`
```php
$defaults = [
    'supported_languages' => ['id', 'en', 'ja', 'zh', 'ar'],
    'global_prompt'       => 'Translate the following text accurately. Preserve formatting.',
    'retry_max_attempts'  => 3,
    'retry_backoff_ms'    => [1000, 2000, 4000],
];

foreach ($defaults as $key => $value) {
    Setting::updateOrCreate(['key' => $key], ['value' => $value]);
}
```

---

## Verification

- [ ] `php artisan migrate:fresh --seed` completes without errors.
- [ ] All 9 tables created in MySQL.
- [ ] `users` table has 1 admin row.
- [ ] `providers` table has 2 rows (SumoPod + fallback), both inactive.
- [ ] `settings` table has default keys.
- [ ] `php artisan migrate:rollback` and re-migrate — no errors.
