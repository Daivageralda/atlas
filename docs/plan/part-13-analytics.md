# Part 13 — Analytics

> **Status**: `[ ]`
> **Depends on**: Part 09 (logs with real data), Part 04 (AppLayout)
> **Blocks**: Nothing

---

## Goal

Aggregated metrics and charts. 6 Recharts visualizations, tenant + date range filter, KPI summary row.

---

## Backend

### `AnalyticsController` (`app/Http/Controllers/Dashboard/AnalyticsController.php`)

```php
public function index(Request $request)
{
    $tenantId = $request->tenant_id;
    $dateFrom = $request->date_from ?? now()->subDays(30)->toDateString();
    $dateTo   = $request->date_to   ?? now()->toDateString();

    // Scope developer
    if (auth()->user()->role === 'developer') {
        $tenantId = auth()->user()->tenant_scope;
    }

    $base = TranslationLog::query()
        ->when($tenantId, fn($q) => $q->where('tenant_id', $tenantId))
        ->whereDate('created_at', '>=', $dateFrom)
        ->whereDate('created_at', '<=', $dateTo);

    $kpi = [
        'total_requests'  => (clone $base)->count(),
        'success_rate'    => $this->rate((clone $base), 'success'),
        'cache_hit_rate'  => $this->rate((clone $base), 'cached'),
        'total_cost'      => (float)(clone $base)->sum('cost_estimate'),
        'total_tokens'    => (int)(clone $base)->sum('token_usage'),
        'avg_latency_ms'  => (int)(clone $base)->where('status', '!=', 'cached')->avg('duration_ms'),
    ];

    $charts = [
        'requests_per_day' => $this->requestsPerDay((clone $base)),
        'success_vs_failed'=> $this->successVsFailed((clone $base)),
        'provider_usage'   => $this->providerUsage((clone $base)),
        'cost_per_day'     => $this->costPerDay((clone $base)),
        'token_usage_day'  => $this->tokenUsagePerDay((clone $base)),
        'avg_latency_day'  => $this->latencyPerDay((clone $base)),
    ];

    return Inertia::render('Analytics/Index', [
        'kpi'     => $kpi,
        'charts'  => $charts,
        'filters' => [
            'tenant_id' => $tenantId,
            'date_from' => $dateFrom,
            'date_to'   => $dateTo,
        ],
        'tenants' => auth()->user()->role === 'admin'
            ? Tenant::select('id', 'name')->get()
            : [],
    ]);
}

// Example helper
private function requestsPerDay($query)
{
    return $query->selectRaw('DATE(created_at) as date, COUNT(*) as total')
        ->groupBy('date')
        ->orderBy('date')
        ->get()
        ->toArray();
}

private function rate($query, string $status)
{
    $total = (clone $query)->count();
    if (!$total) return 0;
    return round(((clone $query)->where('status', $status)->count() / $total) * 100, 1);
}
```

---

## Frontend

### `Pages/Analytics/Index.jsx`

**Filter bar** (top):
```
[Tenant dropdown — admin only]  [Date From]  [Date To]  [Apply]
```
Submit: `router.get(route('analytics.index'), filters, { preserveState: true })`.

**KPI Row** (6 stat cards):
| Label | Value | Format |
|---|---|---|
| Total Requests | `kpi.total_requests` | CountUp |
| Success Rate | `kpi.success_rate` | `N%` |
| Cache Hit Rate | `kpi.cache_hit_rate` | `N%` |
| Total Cost | `kpi.total_cost` | Currency |
| Total Tokens | `kpi.total_tokens` | CountUp |
| Avg Latency | `kpi.avg_latency_ms` | `Nms` |

**Charts Grid** (2 columns, 3 rows — `grid-cols-2`):

| Chart | Type | X | Y | Colors |
|---|---|---|---|---|
| Requests per Day | AreaChart | Date | Count | Emerald fill |
| Success vs Failed | BarChart (stacked) | Date | Count | Emerald / Red |
| Provider Usage | PieChart / DonutChart | Provider | Count | Emerald / Blue |
| Cost per Day | AreaChart | Date | Cost (IDR) | Amber |
| Token Usage | BarChart | Date | Tokens | Blue |
| Avg Latency | LineChart | Date | ms | Purple |

**Chart styling** (Recharts custom):
- Grid lines: `var(--color-border)` at 50% opacity.
- Axis labels: 12px, `var(--color-text-secondary)`.
- Tooltip: custom component styled as Atlas card (bg `--color-card`, border `--color-border`, radius 12px).
- All charts: `ResponsiveContainer width="100%" height={260}`.

**Empty state** (no data in range):
- Icon + "Belum ada data untuk periode ini." + suggestion to adjust filter.

---

## Recharts Integration

```jsx
import {
    AreaChart, Area, BarChart, Bar, LineChart, Line,
    PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend
} from 'recharts'
```

No additional install needed — already in Part 00 deps (`pnpm add recharts`).

Custom tooltip example:
```jsx
function AtlasTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null
    return (
        <div className="bg-atlas-card border border-atlas-border rounded-input p-3 text-xs font-mono">
            <p className="text-atlas-secondary mb-1">{label}</p>
            {payload.map((p: any, i) => (
                <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
            ))}
        </div>
    )
}
```

---

## Verification

- [ ] Analytics page loads with default 30-day range.
- [ ] KPI row shows correct aggregated values.
- [ ] All 6 charts render with data (no blank charts).
- [ ] Date range filter updates all charts and KPI simultaneously.
- [ ] Tenant filter (admin only) — scopes all data to selected tenant.
- [ ] Empty state shows when no logs in date range.
- [ ] Tooltip appears on chart hover with correct styling.
- [ ] Charts are responsive (resize browser window).
- [ ] Developer: tenant filter hidden, data automatically scoped.
- [ ] `pnpm build` — no JavaScript errors in Recharts usage.
