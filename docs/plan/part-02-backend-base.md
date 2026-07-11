# Part 02 — Backend Base

> **Status**: `[ ]`
> **Depends on**: Part 01 (tables exist)
> **Blocks**: Part 03+ (all controllers use these helpers)

---

## Goal

Wire up all backend infrastructure: Sanctum session auth, CORS, middleware stack, `ApiResponse` trait, `HandleInertiaRequests` shared props, and the full route skeleton.

---

## 1. Sanctum Config

Laravel Sanctum in stateful (session/cookie) mode for the dashboard. No tokens — Inertia uses cookie-based session.

`config/sanctum.php`:
```php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', 'localhost,localhost:8000,127.0.0.1')),
'guard' => ['web'],
```

`bootstrap/app.php` — add to web middleware:
```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->web(append: [
        \App\Http\Middleware\HandleInertiaRequests::class,
    ]);
    $middleware->validateCsrfTokens(except: [
        'api/v1/queue/callback', // QStash callback — signed separately
    ]);
})
```

---

## 2. CORS (`config/cors.php`)

```php
'paths'            => ['api/*'],
'allowed_origins'  => [env('FRONTEND_URL', 'http://localhost:8000')],
'allowed_methods'  => ['*'],
'allowed_headers'  => ['*'],
'supports_credentials' => false, // REST API uses X-API-Key, not cookies
```

> Dashboard is same-origin (Inertia / Laravel), so CORS only needed for the tenant REST API if called cross-origin.

---

## 3. `ApiResponse` Trait

`app/Traits/ApiResponse.php`:

```php
<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Http\Resources\Json\JsonResource;

trait ApiResponse
{
    protected function success(mixed $data = null, int $status = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $data,
            'error'   => null,
        ], $status);
    }

    protected function error(string $message, int $status = 400, mixed $details = null): JsonResponse
    {
        return response()->json([
            'success' => false,
            'data'    => null,
            'error'   => ['message' => $message, 'details' => $details],
        ], $status);
    }

    protected function paginated(LengthAwarePaginator $paginator, string $resource): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $resource::collection($paginator)->resolve(),
            'error'   => null,
            'meta'    => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
            ],
        ]);
    }
}
```

Used by all `Api/` controllers. Dashboard controllers use `Inertia::render()` instead.

---

## 4. `HandleInertiaRequests` Middleware

`app/Http/Middleware/HandleInertiaRequests.php`:

```php
<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user() ? [
                    'id'           => $request->user()->id,
                    'name'         => $request->user()->name,
                    'email'        => $request->user()->email,
                    'role'         => $request->user()->role,
                    'tenant_scope' => $request->user()->tenant_scope,
                ] : null,
            ],
            'flash' => [
                'success' => session('success'),
                'error'   => session('error'),
            ],
        ]);
    }
}
```

---

## 5. `AuthenticateApiKey` Middleware

`app/Http/Middleware/AuthenticateApiKey.php`:

```php
<?php

namespace App\Http\Middleware;

use App\Models\ApiKey;
use Closure;
use Illuminate\Http\Request;

class AuthenticateApiKey
{
    public function handle(Request $request, Closure $next)
    {
        $rawKey = $request->header('X-API-Key');

        if (!$rawKey) {
            return response()->json(['success' => false, 'error' => ['message' => 'API key required.']], 401);
        }

        $keyHash = hash('sha256', $rawKey);
        $apiKey  = ApiKey::with('tenant')
            ->where('key_hash', $keyHash)
            ->where('status', 'active')
            ->first();

        if (!$apiKey) {
            return response()->json(['success' => false, 'error' => ['message' => 'Invalid or revoked API key.']], 401);
        }

        $apiKey->update(['last_used_at' => now()]);

        $request->merge(['_api_key' => $apiKey, '_tenant' => $apiKey->tenant]);

        return $next($request);
    }
}
```

---

## 6. `CheckRole` Middleware

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckRole
{
    public function handle(Request $request, Closure $next, string ...$roles): mixed
    {
        if (!in_array($request->user()?->role, $roles)) {
            abort(403, 'Unauthorized.');
        }

        return $next($request);
    }
}
```

Usage: `->middleware('role:admin')` on admin-only routes.

---

## 7. `AuditLogger` Service

`app/Services/AuditLogger.php`:

```php
<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class AuditLogger
{
    public static function log(Model $model, string $action, array $before = [], array $after = []): void
    {
        AuditLog::create([
            'actor_user_id' => Auth::id(),
            'entity_type'   => class_basename($model),
            'entity_id'     => (string) $model->getKey(),
            'action'        => $action,
            'before'        => $before ?: null,
            'after'         => $after ?: null,
        ]);
    }
}
```

Call after every create/update/delete on config entities (Tenant, ApiKey, Provider, User, Settings, Prompt).

---

## 8. Route Structure

### `routes/web.php` — Inertia dashboard

```php
<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Dashboard;
use Illuminate\Support\Facades\Route;

// Public
Route::get('login', [AuthController::class, 'create'])->name('login');
Route::post('login', [AuthController::class, 'store'])->name('login.store');
Route::post('logout', [AuthController::class, 'destroy'])->name('logout')->middleware('auth');

// Protected dashboard
Route::middleware(['auth'])->group(function () {
    Route::get('/', [Dashboard\DashboardController::class, 'index'])->name('dashboard');

    Route::resource('tenants', Dashboard\TenantController::class);
    Route::resource('tenants.api-keys', Dashboard\ApiKeyController::class)->shallow();
    Route::post('api-keys/{apiKey}/revoke', [Dashboard\ApiKeyController::class, 'revoke'])->name('api-keys.revoke');
    Route::post('api-keys/{apiKey}/regenerate', [Dashboard\ApiKeyController::class, 'regenerate'])->name('api-keys.regenerate');

    Route::resource('providers', Dashboard\ProviderController::class);

    Route::get('logs', [Dashboard\LogController::class, 'index'])->name('logs.index');
    Route::get('logs/{log}', [Dashboard\LogController::class, 'show'])->name('logs.show');

    Route::get('memory', [Dashboard\MemoryController::class, 'index'])->name('memory.index');
    Route::put('memory/{memory}', [Dashboard\MemoryController::class, 'update'])->name('memory.update');

    Route::get('queue', [Dashboard\QueueController::class, 'index'])->name('queue.index');
    Route::post('queue/{job}/retry', [Dashboard\QueueController::class, 'retry'])->name('queue.retry');

    Route::get('analytics', [Dashboard\AnalyticsController::class, 'index'])->name('analytics.index');

    Route::resource('users', Dashboard\UserController::class)->except('show');

    Route::get('audit-log', [Dashboard\AuditLogController::class, 'index'])->name('audit-log.index');

    Route::get('settings', [Dashboard\SettingsController::class, 'index'])->name('settings.index');
    Route::put('settings', [Dashboard\SettingsController::class, 'update'])->name('settings.update');
});
```

### `routes/api.php` — Tenant REST API

```php
<?php

use App\Http\Controllers\Api;
use App\Http\Controllers\Queue\QueueCallbackController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // Tenant-facing (X-API-Key auth)
    Route::middleware('auth.api_key')->group(function () {
        Route::post('translate', [Api\TranslateController::class, 'translate']);
        Route::get('translate/{id}', [Api\TranslateController::class, 'show']);
        Route::get('languages', [Api\LanguageController::class, 'index']);
    });

    // QStash callback — verified via QStash signing headers, not session
    Route::post('queue/callback', [QueueCallbackController::class, 'handle']);
});
```

---

## Verification

- [ ] `php artisan route:list` shows all web + api routes with correct middleware.
- [ ] `GET /login` returns 200 (Inertia page).
- [ ] `GET /` without auth redirects to `/login`.
- [ ] `POST /api/v1/translate` without `X-API-Key` returns 401 JSON.
- [ ] `AuditLogger::log()` writes a row to `audit_logs`.
- [ ] `php -l app/Http/Middleware/*.php` — no parse errors.
