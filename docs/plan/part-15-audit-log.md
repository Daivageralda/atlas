# Part 15 — Audit Log

> **Status**: `[ ]`
> **Depends on**: Part 02 (AuditLogger writes rows), Part 04 (AppLayout)
> **Blocks**: Nothing

---

## Goal

Read-only view of all configuration changes. Who changed what, when, before/after diff. Append-only — no edit/delete UI.

---

## Backend

### `AuditLogController` (`app/Http/Controllers/Dashboard/AuditLogController.php`)

```php
public function index(Request $request)
{
    $logs = AuditLog::with('actor')
        ->when($request->entity_type, fn($q) => $q->where('entity_type', $request->entity_type))
        ->when($request->actor_id, fn($q) => $q->where('actor_user_id', $request->actor_id))
        ->when($request->action, fn($q) => $q->where('action', $request->action))
        ->when($request->date_from, fn($q) => $q->whereDate('created_at', '>=', $request->date_from))
        ->when($request->date_to, fn($q) => $q->whereDate('created_at', '<=', $request->date_to))
        ->latest()
        ->paginate(30)
        ->withQueryString();

    return Inertia::render('AuditLog/Index', [
        'logs'         => AuditLogResource::collection($logs),
        'filters'      => $request->only(['entity_type', 'actor_id', 'action', 'date_from', 'date_to']),
        'entity_types' => ['Tenant', 'ApiKey', 'Provider', 'User', 'Settings'],
        'actors'       => User::select('id', 'name')->get(),
    ]);
}
```

### `AuditLogResource`

Returns: `id, actor_name, actor_email, entity_type, entity_id, action, before, after, created_at`.

---

## Frontend

### `Pages/AuditLog/Index.jsx`

```
Header: <h1>Audit Log</h1>
        (Read-only badge — top right, small "append-only" label)

Filter bar:
  [Entity Type — select]  [Actor — select]  [Action — select]  [Date From]  [Date To]

Table (30 per page):
  ACTOR | ACTION | ENTITY | ENTITY ID | DATE | DETAILS
```

**Table columns:**
| Column | Render |
|---|---|
| Actor | Name + email (secondary, smaller) |
| Action | Badge: `created` (success) · `updated` (info) · `deleted` (danger) |
| Entity | Entity type tag |
| Entity ID | Monospace, truncated |
| Date | Full datetime (not relative — audit requires precision) |
| Details | `View diff` button → opens diff modal |

**Diff Modal** (Radix `Dialog`):

```
Title: "[Action] [Entity Type] — [Date]"

Side-by-side or top/bottom diff:
  Before:                         After:
  [JSON formatted — Geist Mono]   [JSON formatted — Geist Mono]

  Changed keys highlighted:
  - Removed / old value: red bg tint
  + Added / new value: emerald bg tint
```

JSON diff rendering: compare `before` and `after` objects key by key. Highlight changed keys.

```jsx
function JsonDiff({ before, after }: { before: Record<string,any>, after: Record<string,any> }) {
    const allKeys = [...new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})])]
    return (
        <div className="font-mono text-xs space-y-1">
            {allKeys.map(key => {
                const bVal = JSON.stringify(before?.[key])
                const aVal = JSON.stringify(after?.[key])
                const changed = bVal !== aVal
                return (
                    <div key={key} className={changed ? 'bg-atlas-warning/10' : ''}>
                        <span className="text-atlas-secondary">{key}: </span>
                        {changed && <span className="line-through text-atlas-danger">{bVal}</span>}
                        {changed && <span className="ml-2 text-atlas-success">{aVal}</span>}
                        {!changed && <span>{bVal}</span>}
                    </div>
                )
            })}
        </div>
    )
}
```

**"Deleted" entries**: `after` is null — show `before` data with full red tint and label "Record deleted".

---

## Verification

- [ ] Audit log loads with all change events from earlier parts.
- [ ] Filter by entity type (Tenant, ApiKey, etc.) works.
- [ ] Filter by actor narrows to specific user's changes.
- [ ] Filter by action (created/updated/deleted) works.
- [ ] Date range filter works.
- [ ] `View diff` modal opens with before/after JSON.
- [ ] Changed keys highlighted correctly (red old, green new).
- [ ] Deleted record: `after` null shows "Record deleted" with before data.
- [ ] No edit/delete buttons anywhere on this page.
- [ ] Admin-only: developer → 403 (or show only their own actions — decide).
- [ ] `created_at` shown as full datetime (not relative).
