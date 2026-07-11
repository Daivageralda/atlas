<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

// Redirect root to dashboard (auth middleware in dashboard route will redirect to login)
Route::redirect('/', '/dashboard');

// Protected dashboard routes
Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', ['App\Http\Controllers\Dashboard\DashboardController', 'index'])->name('dashboard');

    // Tenant / Projects CRUD
    Route::resource('tenants', 'App\Http\Controllers\Dashboard\TenantController');

    // API Keys (Global and shallow endpoints)
    Route::get('api-keys', ['App\Http\Controllers\Dashboard\ApiKeyController', 'index'])->name('api-keys.index');
    Route::post('api-keys', ['App\Http\Controllers\Dashboard\ApiKeyController', 'store'])->name('api-keys.store');
    Route::post('api-keys/{apiKey}/revoke', ['App\Http\Controllers\Dashboard\ApiKeyController', 'revoke'])->name('api-keys.revoke');
    Route::post('api-keys/{apiKey}/regenerate', ['App\Http\Controllers\Dashboard\ApiKeyController', 'regenerate'])->name('api-keys.regenerate');
    Route::delete('api-keys/{apiKey}', ['App\Http\Controllers\Dashboard\ApiKeyController', 'destroy'])->name('api-keys.destroy');

    // AI Providers
    Route::resource('providers', 'App\Http\Controllers\Dashboard\ProviderController');

    // Translation Logs
    Route::get('logs', ['App\Http\Controllers\Dashboard\LogController', 'index'])->name('logs.index');
    Route::get('logs/{log}', ['App\Http\Controllers\Dashboard\LogController', 'show'])->name('logs.show');

    // Translation Memory (Cache)
    Route::get('memory', ['App\Http\Controllers\Dashboard\MemoryController', 'index'])->name('memory.index');
    Route::put('memory/{memory}', ['App\Http\Controllers\Dashboard\MemoryController', 'update'])->name('memory.update');

    // Queue Monitor
    Route::get('queue', ['App\Http\Controllers\Dashboard\QueueController', 'index'])->name('queue.index');
    Route::post('queue/{job}/retry', ['App\Http\Controllers\Dashboard\QueueController', 'retry'])->name('queue.retry');

    // Analytics
    Route::get('analytics', ['App\Http\Controllers\Dashboard\AnalyticsController', 'index'])->name('analytics.index');

    // User management (admin only)
    Route::resource('users', 'App\Http\Controllers\Dashboard\UserController')->except('show');

    // Audit logs (admin only)
    Route::get('audit-log', ['App\Http\Controllers\Dashboard\AuditLogController', 'index'])->name('audit-log.index');

    // Settings
    Route::get('settings', ['App\Http\Controllers\Dashboard\SettingsController', 'index'])->name('settings.index');
    Route::put('settings', ['App\Http\Controllers\Dashboard\SettingsController', 'update'])->name('settings.update');

    // API Documentation
    Route::get('docs', ['App\Http\Controllers\Dashboard\DocumentationController', 'index'])->name('docs.index');

    // Profile editing (Breeze default)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Explicit login overrides pointing to custom AuthController
Route::middleware('guest')->group(function () {
    Route::get('login', ['App\Http\Controllers\Auth\AuthController', 'create'])->name('login');
    Route::post('login', ['App\Http\Controllers\Auth\AuthController', 'store'])->name('login.store');
});

Route::post('logout', ['App\Http\Controllers\Auth\AuthController', 'destroy'])
    ->middleware('auth')
    ->name('logout');

require __DIR__.'/auth.php';
