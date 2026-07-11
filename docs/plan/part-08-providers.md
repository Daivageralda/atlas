# Part 08 — Providers

> **Status**: `[ ]`
> **Depends on**: Part 04 (AppLayout), Part 02 (AuditLogger)
> **Blocks**: Part 09 (Translation Core needs provider records)

---

## Goal

CRUD for AI translation providers (SumoPod + fallback). Configure API URL, encrypted API key, pricing formula, enable/disable. Audit all changes.

---

## Backend

### `ProviderController` (`app/Http/Controllers/Dashboard/ProviderController.php`)

```php
public function index()
{
    return Inertia::render('Providers/Index', [
        'providers' => ProviderResource::collection(Provider::all()),
    ]);
}

public function store(StoreProviderRequest $request)
{
    $data = $request->validated();
    if (isset($data['api_key_plain'])) {
        $data['api_key_encrypted'] = encrypt($data['api_key_plain']);
        unset($data['api_key_plain']);
    }

    $provider = Provider::create($data);
    AuditLogger::log($provider, 'created', [], $this->safeProviderArray($provider));

    return redirect()->route('providers.index')->with('success', 'Provider ditambahkan.');
}

public function update(UpdateProviderRequest $request, Provider $provider)
{
    $before = $this->safeProviderArray($provider);
    $data   = $request->validated();

    if (isset($data['api_key_plain'])) {
        $data['api_key_encrypted'] = encrypt($data['api_key_plain']);
        unset($data['api_key_plain']);
    }

    $provider->update($data);
    AuditLogger::log($provider, 'updated', $before, $this->safeProviderArray($provider->fresh()));

    return redirect()->route('providers.index')->with('success', 'Provider diperbarui.');
}

public function destroy(Provider $provider)
{
    $before = $this->safeProviderArray($provider);
    $provider->delete();
    AuditLogger::log($provider, 'deleted', $before, []);

    return redirect()->route('providers.index')->with('success', 'Provider dihapus.');
}

// Never log or return api_key_encrypted
private function safeProviderArray(Provider $provider)
{
    return $provider->only('id', 'name', 'role', 'api_url', 'pricing_formula', 'is_active', 'config');
}
```

### Validation

`StoreProviderRequest`:
- `name`: required|string|max:100
- `role`: required|in:primary,fallback
- `api_url`: required|url
- `api_key_plain`: nullable|string (if provided, encrypted before store)
- `pricing_formula`: nullable|array (`unit` in:per_char,per_token, `rate` numeric|min:0)
- `is_active`: required|boolean

### `ProviderResource`

Returns: `id, name, role, api_url, pricing_formula, is_active, config`.
**Never returns `api_key_encrypted`.**

---

## Frontend

### `Pages/Providers/Index.jsx`

```
Header: <h1>Providers</h1>       [+ Add Provider — primary button]
─────────────────────────────────────────
2-column grid (or list if <3 providers):

┌─────────────────────────────────┐  ┌──────────────────────────────┐
│ [PRIMARY badge]                 │  │ [FALLBACK badge]              │
│ SumoPod                         │  │ Public Translation API        │
│ Status: ● Active / ○ Inactive   │  │ Status: ● Active / ○ Inactive│
│ URL: https://...                │  │ URL: https://...             │
│ Pricing: per_char @ 0.0001     │  │ Pricing: —                   │
│                    [Edit] [Del] │  │                  [Edit] [Del]│
└─────────────────────────────────┘  └──────────────────────────────┘
```

- Provider card: `bg-atlas-card rounded-card border border-atlas-border p-5`.
- Status toggle: Radix `Switch`, triggers PUT on change with `is_active` toggled.
- Role badge: `PRIMARY` → info color, `FALLBACK` → secondary color.
- **V1**: max 2 providers (1 primary + 1 fallback). UI can support more, but seeder and product spec are 2.

### Create / Edit Modal

Radix `Dialog`. Fields:
- **Name** (required)
- **Role** (select: Primary / Fallback)
- **API URL** (required, url input)
- **API Key** (password input, optional on edit — leave blank to keep existing)
  - Helper text: "Leave empty to keep current key."
- **Pricing Formula**:
  - Unit: select (Per Character / Per Token)
  - Rate input, step 0.00001
- **Enable Now** (checkbox/switch)

> API key field: `type="password"`, `autocomplete="off"`. On edit, placeholder "••••••••" if key already set. Empty submit means "don't change key".

### Delete Confirmation

Only deletable if provider is inactive:
```
"Hapus provider ini?"
"Pastikan provider sudah dinonaktifkan sebelum menghapus."
```

---

## Verification

- [ ] Provider list shows both seeded providers (SumoPod, fallback).
- [ ] Status switch toggles `is_active`, updates badge immediately via Inertia redirect.
- [ ] Create: all required fields validated.
- [ ] Create: API key encrypted in DB (`api_key_encrypted` not null).
- [ ] Edit: leaving API key blank preserves existing key.
- [ ] Edit: entering new API key re-encrypts and saves.
- [ ] `api_key_encrypted` never appears in Inertia props or Network tab.
- [ ] Delete: confirmation dialog shows provider name.
- [ ] `AuditLog` row on create, update, delete.
- [ ] `php artisan tinker` → `decrypt(Provider::first()->api_key_encrypted)` returns the key.
- [ ] Role guard: only `admin` can access Providers page (developer → 403).
