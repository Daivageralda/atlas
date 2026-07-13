<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\ApiKey;
use App\Models\Provider;
use App\Models\QueueJob;
use App\Models\TranslationLog;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $isAdmin = $user->isAdmin();
        $tenantScope = $user->tenant_scope;
        $today = now()->startOfDay();

        $logQuery = TranslationLog::where('created_at', '>=', $today)
            ->when(!$isAdmin, fn($q) => $q->where('tenant_id', $tenantScope));

        $stats = [
            'requests_today'       => (clone $logQuery)->count(),
            'success_rate'         => $this->successRate($today, $isAdmin, $tenantScope),
            'avg_response_ms'      => (int) (clone $logQuery)->avg('duration_ms'),
            'token_usage_today'    => (int) (clone $logQuery)->sum('token_usage'),
            'failure_rate'         => $this->failureRate($today, $isAdmin, $tenantScope),
            'estimated_cost_today' => (float) (clone $logQuery)->sum('cost_estimate') * config('services.exchange.usd_to_idr'),
            'active_users'         => $isAdmin ? User::where('status', 'active')->count() : null,
            'active_api_keys'      => ApiKey::whereNull('revoked_at')
                                        ->where(fn($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))
                                        ->when(!$isAdmin, fn($q) => $q->where('tenant_id', $tenantScope))
                                        ->count(),
            'cache_hit_rate'       => $this->cacheHitRate($today, $isAdmin, $tenantScope),
            'queue_pending'        => QueueJob::where('status', 'pending')
                                        ->when(!$isAdmin, fn($q) => $q->whereJsonContains('payload->tenant_id', $tenantScope))
                                        ->count(),
        ];

        $systemStatus = [
            'providers'          => Provider::select('name', 'role', 'is_active')->get(),
            'queue_failed_today' => QueueJob::where('status', 'failed')
                                        ->where('created_at', '>=', $today)
                                        ->when(!$isAdmin, fn($q) => $q->whereJsonContains('payload->tenant_id', $tenantScope))
                                        ->count(),
        ];

        $recentLogs = \App\Http\Resources\TranslationLogResource::collection(
            TranslationLog::with('tenant')
                ->when(!$isAdmin, fn($q) => $q->where('tenant_id', $tenantScope))
                ->latest()
                ->take(5)
                ->get()
        );

        return Inertia::render('Dashboard', compact('stats', 'systemStatus', 'recentLogs'));
    }

    private function successRate($today, $isAdmin, $tenantScope)
    {
        $logQuery = TranslationLog::where('created_at', '>=', $today)
            ->when(!$isAdmin, fn($q) => $q->where('tenant_id', $tenantScope));

        $total = (clone $logQuery)->count();
        if ($total === 0) return 100;
        
        $success = (clone $logQuery)->where('status', 'success')->count();
        $cached = (clone $logQuery)->where('status', 'cached')->count();

        return round((($success + $cached) / $total) * 100, 1);
    }

    private function failureRate($today, $isAdmin, $tenantScope)
    {
        $logQuery = TranslationLog::where('created_at', '>=', $today)
            ->when(!$isAdmin, fn($q) => $q->where('tenant_id', $tenantScope));

        $total = (clone $logQuery)->count();
        if ($total === 0) return 0;

        $failed = (clone $logQuery)->where('status', 'failed')->count();

        return round(($failed / $total) * 100, 1);
    }

    private function cacheHitRate($today, $isAdmin, $tenantScope)
    {
        $logQuery = TranslationLog::where('created_at', '>=', $today)
            ->when(!$isAdmin, fn($q) => $q->where('tenant_id', $tenantScope));

        $total = (clone $logQuery)->count();
        if ($total === 0) return 0;

        $cached = (clone $logQuery)->where('status', 'cached')->count();

        return round(($cached / $total) * 100, 1);
    }
}
