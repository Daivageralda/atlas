# Part 06 — Tenants

> **Status**: `[ ]`
> **Depends on**: Part 04 (AppLayout), Part 02 (AuditLogger), Part 17 (Table, Modal, Badge)
> **Blocks**: Part 07 (API Keys reference tenant)

---

## Goal

Full CRUD for tenants: list page (table + filters), create/edit modal, delete confirmation, detail view with tabs (Overview, API Keys, Logs, Analytics).

---

## Backend

### `TenantController` (`app/Http/Controllers/Dashboard/TenantController.php`)

```php
// index — paginated list, filterable by status + search
public function index(Request $request)
{
    $tenants = Tenant::query()
        ->when($request->search, fn($q) => $q->where('name', 'like', "%{$request->search}%"))
        ->when($request->status, fn($q) => $q->where('status', $request->status))
        ->withCount('apiKeys')
        ->latest()
        ->paginate(20)
        ->withQueryString();

    return Inertia::render('Tenants/Index', [
        'tenants' => TenantResource::collection($tenants),
        'filters' => $request->only(['search', 'status']),
    ]);
}

// store — create tenant
public function store(StoreTenantRequest $request)
{
    $tenant = Tenant::create($request->validated());
    AuditLogger::log($tenant, 'created', [], $tenant->toArray());

    return redirect()->route('tenants.index')->with('success', 'Tenant berhasil dibuat.');
}

// show — detail page with tab data
public function show(Tenant $tenant)
{
    return Inertia::render('Tenants/Show', [
        'tenant'   => new TenantDetailResource($tenant),
        'apiKeys'  => ApiKeyResource::collection($tenant->apiKeys()->latest()->get()),
        'overview' => [
            'total_translations' => TranslationLog::where('tenant_id', $tenant->id)->count(),
            'total_cost'         => TranslationLog::where('tenant_id', $tenant->id)->sum('cost_estimate'),
            'cache_hit_count'    => TranslationLog::where('tenant_id', $tenant->id)->where('status', 'cached')->count(),
        ],
    ]);
}

// update
public function update(UpdateTenantRequest $request, Tenant $tenant)
{
    $before = $tenant->toArray();
    $tenant->update($request->validated());
    AuditLogger::log($tenant, 'updated', $before, $tenant->fresh()->toArray());

    return redirect()->route('tenants.show', $tenant)->with('success', 'Tenant diperbarui.');
}

// destroy
public function destroy(Tenant $tenant)
{
    $before = $tenant->toArray();
    $tenant->delete();
    AuditLogger::log($tenant, 'deleted', $before, []);

    return redirect()->route('tenants.index')->with('success', 'Tenant dihapus.');
}
```

### Validation Requests

`StoreTenantRequest`: `name` required|string|min:2|max:100, `type` nullable|string|max:100, `status` required|in:active,inactive.

`UpdateTenantRequest`: same rules, `sometimes` on all fields.

### `TenantResource`

Returns: `id, name, type, status, api_keys_count, created_at (formatted)`.

---

## Frontend

### `Pages/Tenants/Index.jsx`

```
Header row:
  <h1>Projects / Tenants</h1>          [+ New Tenant — primary button]
─────────────────────────────────────────────────────────
Search input (left)          Status filter (dropdown: All/Active/Inactive)
─────────────────────────────────────────────────────────
Table:
  NAME | TYPE | STATUS | API KEYS | CREATED | ACTIONS
─────────────────────────────────────────────────────────
Pagination
```

**Table columns:**
| Column | Render |
|---|---|
| Name | Bold, `<Link href={route('tenants.show', id)}>` |
| Type | Plain text or "—" |
| Status | Badge: `Active` (success) / `Inactive` (disabled) |
| API Keys | Count badge |
| Created | Relative date |
| Actions | Edit icon (opens edit modal) · Delete icon (opens confirm dialog) |

**Filters**: use Inertia `router.get(route('tenants.index'), filters, { preserveState: true, replace: true })` on input change (debounced 300ms).

**Empty state**: "Belum ada tenant" + icon + "Buat Tenant Pertama" button.

**Loading**: Inertia `useEffect` on `router.on('start')` → show row skeletons.

### Create / Edit Modal

Radix `Dialog`. Form via `useForm()`:
```jsx
const { data, setData, post, put, processing, errors, reset } = useForm({
    name: tenant?.name ?? '',
    type: tenant?.type ?? '',
    status: tenant?.status ?? 'active',
})
```

- Create: `post(route('tenants.store'))`.
- Edit: `put(route('tenants.update', tenant.id))`.
- On success (Inertia redirect): modal closes automatically (detect by `processing` going false + no errors).
- Error: show inline under each field.

### Delete Confirmation

Radix `AlertDialog`:
```
Title: "Hapus [Tenant Name]?"
Body: "Semua API key tenant ini akan dinonaktifkan. Tindakan ini tidak dapat dibatalkan."
Actions: [Batal] [Hapus] (destructive)
```

Submit: `useForm().delete(route('tenants.destroy', id))`.

### `Pages/Tenants/Show.jsx`

Radix `Tabs`: **Overview** | **API Keys** | **Logs** | **Analytics**

- **Overview**: stat summary (total translations, total cost, cache hit count), tenant metadata.
- **API Keys**: embedded table (data from props `apiKeys`) — full API Keys management moved to Part 07.
- **Logs**: link to `/logs?tenant_id={id}` (scoped view, not embedded in V1 — reduces complexity).
- **Analytics**: link to `/analytics?tenant_id={id}`.

---

## Verification

- [ ] Tenant list loads with pagination (20 per page).
- [ ] Search filters by name (debounced, Inertia preserveState).
- [ ] Status filter works (Active / Inactive / All).
- [ ] Empty state shows when no tenants match filter.
- [ ] Create modal: name required — shows error on empty submit.
- [ ] Create: success toast via `flash.success` shared prop. New tenant appears in list.
- [ ] Edit: form pre-populated with existing values.
- [ ] Edit: success toast, row updated.
- [ ] Delete dialog: shows tenant name. Confirms destructive action.
- [ ] Delete: success toast, row removed.
- [ ] Detail page: all 4 tabs render without error.
- [ ] Breadcrumb: "Tenants → [Name]".
- [ ] Admin sees all tenants. Developer sees only their `tenant_scope` — enforce in controller `when(!auth()->user()->isAdmin(), ...)`.
- [ ] `AuditLog` row created on create, update, delete.
