# Part 05 — Dashboard

> **Status**: `[ ]`
> **Depends on**: Part 04 (AppLayout), Part 17 (StatCard from Shared UI — or build inline first)
> **Blocks**: Nothing directly

---

## Goal

Landing page after login. 10 KPI cards with CountUp, system status summary, quick-links. All data fetched server-side and passed as Inertia props.

---

## Backend

### `DashboardController` (`app/Http/Controllers/Dashboard/DashboardController.php`)

```php
public function index()
{
    $today = now()->startOfDay();

    $stats = [
        'requests_today'      => TranslationLog::where('created_at', '>=', $today)->count(),
        'success_rate'        => $this->successRate($today),
        'avg_response_ms'     => (int) TranslationLog::where('created_at', '>=', $today)->avg('duration_ms'),
        'token_usage_today'   => (int) TranslationLog::where('created_at', '>=', $today)->sum('token_usage'),
        'failure_rate'        => $this->failureRate($today),
        'estimated_cost_today'=> (float) TranslationLog::where('created_at', '>=', $today)->sum('cost_estimate'),
        'active_users'        => User::where('status', 'active')->count(),
        'active_api_keys'     => ApiKey::where('status', 'active')->count(),
        'cache_hit_rate'      => $this->cacheHitRate($today),
        'queue_pending'       => QueueJob::where('status', 'pending')->count(),
    ];

    $systemStatus = [
        'primary_provider'   => Provider::where('role', 'primary')->first()?->only('name', 'is_active'),
        'fallback_provider'  => Provider::where('role', 'fallback')->first()?->only('name', 'is_active'),
        'queue_failed_today' => QueueJob::where('status', 'failed')->where('created_at', '>=', $today)->count(),
    ];

    return Inertia::render('Dashboard', compact('stats', 'systemStatus'));
}
```

Private helpers: `successRate()`, `failureRate()`, `cacheHitRate()` — simple percentage calculations.

---

## Frontend

### `resources/js/Pages/Dashboard.jsx`

Props:
```js
/** @type props */
    stats: {
        requests_today
        success_rate        // 0–100
        avg_response_ms
        token_usage_today
        failure_rate        // 0–100
        estimated_cost_today
        active_users
        active_api_keys
        cache_hit_rate      // 0–100
        queue_pending
    }
    systemStatus: {
        primary_provider: { name; is_active } | null
        fallback_provider: { name; is_active } | null
        queue_failed_today
    }
}
```

### KPI Cards Layout

10 cards in `repeat(auto-fit, minmax(220px, 1fr))` grid.

| Label | Value | Suffix | CountUp | Danger threshold |
|---|---|---|---|---|
| Requests Today | `requests_today` | — | ✓ | — |
| Success Rate | `success_rate` | `%` | ✓ | < 90% → warning |
| Avg Response | `avg_response_ms` | `ms` | ✓ | — |
| Token Usage | `token_usage_today` | — | ✓ | — |
| Cache Hit Rate | `cache_hit_rate` | `%` | ✓ | — |
| Failure Rate | `failure_rate` | `%` | ✓ | > 5% → danger |
| Est. Cost Today | `estimated_cost_today` | — | ✓ | — |
| Active Users | `active_users` | — | ✓ | — |
| Active API Keys | `active_api_keys` | — | ✓ | — |
| Queue Pending | `queue_pending` | — | ✓ | > 50 → warning |

### `StatCard.jsx` Component

```jsx
/** @type props */
    label
    value
    suffix?
    prefix?
    useCountUp?     // default true
    status?: 'default' | 'warning' | 'danger'
}
```

Structure:
```
[label — 12px, --color-text-secondary, uppercase, letter-spacing 0.08em]
[value — 32–36px, tabular-nums, weight 600, optional CountUp]
[status chip — optional, badge with warning/danger color]
```

- Card: `bg-atlas-card border border-atlas-border rounded-card p-5`.
- Status chip: `--color-warning` or `--color-danger` at 15% opacity bg, full color text.
- Loading: skeleton shimmer (card shape, `animate-pulse`).

### System Status Card

```
Provider status row:
  [dot: emerald=active, red=inactive] SumoPod — Active / Inactive
  [dot] Public Translation API — Active / Inactive

Queue: [N] jobs pending | [N] failed today
Last updated: [timestamp]
```

### Quick Links (3–4 cards)

- View Translation Logs
- Manage Tenants
- Configure Providers
- View Analytics

Each: Lucide icon + label + `ChevronRight`. `Link href={route('...')}` from Inertia.

---

## Verification

- [ ] All 10 KPI cards render with correct labels and values from props.
- [ ] CountUp animates once on mount, not on re-render.
- [ ] CountUp skips animation when `prefers-reduced-motion: reduce`.
- [ ] Failure rate card shows danger status when > 5%.
- [ ] System status shows correct active/inactive for each provider.
- [ ] Quick links navigate correctly with Inertia (no full reload).
- [ ] Page `<h1>` is "Dashboard" (semantic).
- [ ] Grid reflows at tablet (2–3 cols) and mobile (1–2 cols).
- [ ] `php artisan route:list` shows `GET /` → `DashboardController@index`.
