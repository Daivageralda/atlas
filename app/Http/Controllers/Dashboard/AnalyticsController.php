<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\TranslationLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $tenantId = $request->tenant_id;
        
        $dateFrom = $request->date_from ?? now()->subDays(30)->toDateString();
        $dateTo   = $request->date_to   ?? now()->toDateString();

        // Scope non-admin users
        if (!$user->isAdmin()) {
            $tenantId = $user->tenant_scope;
        }

        $base = TranslationLog::query()
            ->when($tenantId, fn($q) => $q->where('tenant_id', $tenantId))
            ->whereDate('created_at', '>=', $dateFrom)
            ->whereDate('created_at', '<=', $dateTo);

        // Aggregate KPI counts
        $kpi = [
            'total_requests' => (clone $base)->count(),
            'success_rate'   => $this->rate((clone $base), 'success'),
            'cache_hit_rate' => $this->rate((clone $base), 'cached'),
            'total_cost'     => (float)(clone $base)->sum('cost_estimate') * config('services.exchange.usd_to_idr'),
            'total_tokens'   => (int)(clone $base)->sum('token_usage'),
            'avg_latency_ms' => (int)(clone $base)->where('status', '!=', 'cached')->avg('duration_ms'),
        ];

        // Format charts series data
        $charts = [
            'requests_per_day'  => $this->requestsPerDay((clone $base)),
            'success_vs_failed' => $this->successVsFailed((clone $base)),
            'provider_usage'    => $this->providerUsage((clone $base)),
            'cost_per_day'      => $this->costPerDay((clone $base)),
            'token_usage_day'   => $this->tokenUsagePerDay((clone $base)),
            'avg_latency_day'   => $this->latencyPerDay((clone $base)),
        ];

        return Inertia::render('Analytics/Index', [
            'kpi'     => $kpi,
            'charts'  => $charts,
            'filters' => [
                'tenant_id' => $tenantId,
                'date_from' => $dateFrom,
                'date_to'   => $dateTo,
            ],
            'tenants' => $user->isAdmin()
                ? Tenant::select('id', 'name')->get()->toArray()
                : [],
        ]);
    }

    private function requestsPerDay($query): array
    {
        return $query->selectRaw('DATE(created_at) as date, COUNT(*) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn($item) => ['date' => $item->date, 'total' => (int) $item->total])
            ->toArray();
    }

    private function successVsFailed($query): array
    {
        return $query->selectRaw("DATE(created_at) as date, 
                SUM(CASE WHEN status IN ('success', 'cached') THEN 1 ELSE 0 END) as success,
                SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed")
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn($item) => [
                'date' => $item->date, 
                'success' => (int) $item->success, 
                'failed' => (int) $item->failed
            ])
            ->toArray();
    }

    private function providerUsage($query): array
    {
        return $query->selectRaw('provider as name, COUNT(*) as value')
            ->whereNotNull('provider')
            ->groupBy('provider')
            ->get()
            ->map(fn($item) => ['name' => $item->name, 'value' => (int) $item->value])
            ->toArray();
    }

    private function costPerDay($query): array
    {
        return $query->selectRaw('DATE(created_at) as date, SUM(cost_estimate) as cost')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn($item) => ['date' => $item->date, 'cost' => (float) $item->cost * config('services.exchange.usd_to_idr')])
            ->toArray();
    }

    private function tokenUsagePerDay($query): array
    {
        return $query->selectRaw('DATE(created_at) as date, SUM(token_usage) as tokens')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn($item) => ['date' => $item->date, 'tokens' => (int) $item->tokens])
            ->toArray();
    }

    private function latencyPerDay($query): array
    {
        return $query->selectRaw('DATE(created_at) as date, AVG(duration_ms) as ms')
            ->where('status', '!=', 'cached')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn($item) => ['date' => $item->date, 'latency' => round((float) $item->ms, 1)])
            ->toArray();
    }

    private function rate($query, string $status): float
    {
        $total = (clone $query)->count();
        if (!$total) return 0;
        
        $match = $status === 'success' 
            ? (clone $query)->whereIn('status', ['success', 'cached'])->count() 
            : (clone $query)->where('status', $status)->count();

        return round(($match / $total) * 100, 1);
    }
}
