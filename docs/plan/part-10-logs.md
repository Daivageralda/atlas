# Part 10 — Translation Logs

> **Status**: `[ ]`
> **Depends on**: Part 09 (logs written), Part 04 (AppLayout)
> **Blocks**: Nothing

---

## Goal

Browse, filter, and drill into translation request logs. Dense data table with status badges, provider indicator, and a detail side panel with full request metadata.

---

## Backend

### `LogController` (`app/Http/Controllers/Dashboard/LogController.php`)

```php
public function index(Request $request)
{
    $query = TranslationLog::with(['tenant', 'apiKey'])
        ->when($request->tenant_id, fn($q) => $q->where('tenant_id', $request->tenant_id))
        ->when($request->status, fn($q) => $q->where('status', $request->status))
        ->when($request->provider, fn($q) => $q->where('provider', $request->provider))
        ->when($request->date_from, fn($q) => $q->whereDate('created_at', '>=', $request->date_from))
        ->when($request->date_to, fn($q) => $q->whereDate('created_at', '<=', $request->date_to))
        ->when($request->search, fn($q) => $q->where('id', 'like', "%{$request->search}%"))
        ->latest()
        ->paginate(50)
        ->withQueryString();

    // Scope developer to their tenant only
    if (auth()->user()->role === 'developer') {
        $query->where('tenant_id', auth()->user()->tenant_scope);
    }

    return Inertia::render('Logs/Index', [
        'logs'    => TranslationLogResource::collection($query),
        'filters' => $request->only(['tenant_id', 'status', 'provider', 'date_from', 'date_to', 'search']),
        'tenants' => auth()->user()->role === 'admin'
            ? Tenant::select('id', 'name')->get()
            : [],
    ]);
}

public function show(TranslationLog $log)
{
    // Ensure developer can only see own tenant's log
    if (auth()->user()->role === 'developer' && $log->tenant_id !== auth()->user()->tenant_scope) {
        abort(403);
    }

    return Inertia::render('Logs/Show', [
        'log' => new TranslationLogDetailResource($log->load('tenant', 'apiKey')),
    ]);
}
```

### `TranslationLogResource`

Returns: `id, tenant_name, status, provider, content_type, source_lang, target_lang, retry_count, fallback_used, duration_ms, estimated_cost, cached (status === 'cached'), created_at`.

### `TranslationLogDetailResource`

Returns all above + `request_payload, response_payload, error_message, api_key_label`.

---

## Frontend

### `Pages/Logs/Index.jsx`

```
Header: <h1>Translation Logs</h1>

Filter bar:
  [Search by ID]  [Tenant dropdown — admin only]  [Status]  [Provider]  [Date From]  [Date To]  [Reset]

Table (50 per page, paginated):
  ID | TENANT | STATUS | PROVIDER | TYPE | LANGS | RETRIES | COST | DURATION | DATE
```

**Table columns** (compact, 40–44px rows):
| Column | Render |
|---|---|
| ID | Monospace, truncated to 8 chars, `font-mono text-xs` |
| Tenant | Text |
| Status | Badge: `cached` (info) · `success` (success) · `failed` (danger) |
| Provider | Text or "—" if cached |
| Type | `plain` / `html` / `markdown` tag |
| Langs | `id → en` arrow format |
| Retries | Number, danger color if > 0 |
| Cost | Formatted decimal or "—" |
| Duration | `Nms` |
| Date | Relative time |

Click row → navigates to `Logs/Show` (Inertia `<Link>`).

**Filter behavior**: Inertia `router.get` with `preserveState: true, replace: true` on each filter change (debounced 300ms for text inputs).

**Empty state**: "Belum ada log" + (if filters active) "Coba hapus filter."

### `Pages/Logs/Show.jsx`

```
Breadcrumb: Translation Logs → [Log ID]

Left column (70%):
  Metadata card:
    Status badge · Provider · Tenant · API Key · Date
    source_lang → target_lang · content_type
    Duration · Retry count · Fallback used (yes/no badge) · Estimated cost

Right column (30%):
  Error (if failed):
    Red banner with error_message

  Request payload:
    Code block (Geist Mono, 13px, copy button)

  Response payload (if available):
    Code block (Geist Mono, 13px, copy button)
```

Code block component: dark bg (`var(--color-surface)`), line numbers secondary color, copy icon button top-right.

---

## Verification

- [ ] Log table loads with correct columns and pagination.
- [ ] Status badge colors: cached=info, success=success, failed=danger.
- [ ] Filter by tenant (admin only dropdown visible).
- [ ] Filter by status works.
- [ ] Filter by date range filters rows correctly.
- [ ] Reset clears all filters, reload full list.
- [ ] Row click navigates to detail page (Inertia — no full reload).
- [ ] Detail page: all metadata fields shown.
- [ ] Code block: copy button copies payload to clipboard.
- [ ] Failed log: error message shown in red banner.
- [ ] Developer: only sees logs for own tenant. Navigating to another tenant's log → 403.
- [ ] 50 rows per page — pagination controls work.
