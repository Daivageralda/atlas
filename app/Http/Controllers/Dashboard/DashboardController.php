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
        $today = now()->startOfDay();

        $stats = [
            'requests_today'       => TranslationLog::where('created_at', '>=', $today)->count(),
            'success_rate'         => $this->successRate($today),
            'avg_response_ms'      => (int) TranslationLog::where('created_at', '>=', $today)->avg('duration_ms'),
            'token_usage_today'    => (int) TranslationLog::where('created_at', '>=', $today)->sum('token_usage'),
            'failure_rate'         => $this->failureRate($today),
            'estimated_cost_today' => (float) TranslationLog::where('created_at', '>=', $today)->sum('cost_estimate'),
            'active_users'         => User::where('status', 'active')->count(),
            'active_api_keys'      => ApiKey::where('status', 'active')->count(),
            'cache_hit_rate'       => $this->cacheHitRate($today),
            'queue_pending'        => QueueJob::where('status', 'pending')->count(),
        ];

        $systemStatus = [
            'primary_provider'   => Provider::where('role', 'primary')->first()?->only('name', 'is_active'),
            'fallback_provider'  => Provider::where('role', 'fallback')->first()?->only('name', 'is_active'),
            'queue_failed_today' => QueueJob::where('status', 'failed')->where('created_at', '>=', $today)->count(),
        ];

        return Inertia::render('Dashboard', compact('stats', 'systemStatus'));
    }

    private function successRate($today)
    {
        $total = TranslationLog::where('created_at', '>=', $today)->count();
        if ($total === 0) return 100;
        
        $success = TranslationLog::where('created_at', '>=', $today)->where('status', 'success')->count();
        $cached = TranslationLog::where('created_at', '>=', $today)->where('status', 'cached')->count();

        return round((($success + $cached) / $total) * 100, 1);
    }

    private function failureRate($today)
    {
        $total = TranslationLog::where('created_at', '>=', $today)->count();
        if ($total === 0) return 0;

        $failed = TranslationLog::where('created_at', '>=', $today)->where('status', 'failed')->count();

        return round(($failed / $total) * 100, 1);
    }

    private function cacheHitRate($today)
    {
        $total = TranslationLog::where('created_at', '>=', $today)->count();
        if ($total === 0) return 0;

        $cached = TranslationLog::where('created_at', '>=', $today)->where('status', 'cached')->count();

        return round(($cached / $total) * 100, 1);
    }
}
