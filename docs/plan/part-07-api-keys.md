# Part 07 — API Keys

> **Status**: `[ ]`
> **Depends on**: Part 06 (Tenant exists), Part 02 (AuthenticateApiKey middleware already written)
> **Blocks**: Nothing — but tenant-facing translation (Part 09) requires a valid key

---

## Goal

Create, revoke, and regenerate API keys per tenant. The raw key is shown once on creation (via a modal) and never stored — only the SHA-256 hash is persisted.

---

## Backend

### Key Generation

```php
// Utility — usable anywhere
function generateApiKey()
{
    $raw  = 'atl_' . bin2hex(random_bytes(24)); // atl_ prefix + 48 hex chars
    $hash = hash('sha256', $raw);
    return ['raw' => $raw, 'hash' => $hash];
}
```

### `ApiKeyController` (`app/Http/Controllers/Dashboard/ApiKeyController.php`)

```php
// index — list keys for a tenant (shallow resource)
public function index(Tenant $tenant)
{
    $keys = $tenant->apiKeys()->latest()->get();
    return Inertia::render('ApiKeys/Index', [
        'tenant'  => $tenant->only('id', 'name'),
        'apiKeys' => ApiKeyResource::collection($keys),
    ]);
}

// store — create new key
public function store(StoreApiKeyRequest $request, Tenant $tenant)
{
    ['raw' => $raw, 'hash' => $hash] = generateApiKey();

    $apiKey = $tenant->apiKeys()->create([
        'label'    => $request->label,
        'key_hash' => $hash,
        'scopes'   => $request->scopes ?? null,
        'status'   => 'active',
    ]);

    AuditLogger::log($apiKey, 'created', [], $apiKey->toArray());

    // Flash the raw key — shown once, never stored
    return redirect()
        ->route('api-keys.index', $tenant)
        ->with('new_key', $raw)
        ->with('success', 'API key berhasil dibuat.');
}

// revoke
public function revoke(ApiKey $apiKey)
{
    $before = $apiKey->toArray();
    $apiKey->update(['status' => 'revoked']);
    AuditLogger::log($apiKey, 'updated', $before, $apiKey->fresh()->toArray());

    return back()->with('success', 'API key dinonaktifkan.');
}

// regenerate — revoke old, create new, return raw key once
public function regenerate(ApiKey $apiKey)
{
    ['raw' => $raw, 'hash' => $hash] = generateApiKey();

    $before = $apiKey->toArray();
    $apiKey->update(['key_hash' => $hash, 'status' => 'active', 'last_used_at' => null]);
    AuditLogger::log($apiKey, 'updated', $before, $apiKey->fresh()->toArray());

    return back()->with('new_key', $raw)->with('success', 'API key diperbarui.');
}

// destroy
public function destroy(ApiKey $apiKey)
{
    $before = $apiKey->toArray();
    $apiKey->delete();
    AuditLogger::log($apiKey, 'deleted', $before, []);

    return back()->with('success', 'API key dihapus.');
}
```

### Share `new_key` via `HandleInertiaRequests`

Add to `share()`:
```php
'flash' => [
    'success' => session('success'),
    'error'   => session('error'),
    'new_key' => session('new_key'),   // ← raw key, one-time
],
```

### `ApiKeyResource`

Returns: `id, tenant_id, label, status, scopes, last_used_at, created_at`.
**Never returns `key_hash` or the raw key** (the raw key is only in flash, not in the resource).

---

## Frontend

### `Pages/ApiKeys/Index.jsx`

```
Breadcrumb: Tenants → [Tenant Name] → API Keys

Header:
  <h1>API Keys — [Tenant Name]</h1>    [+ New API Key — primary button]
─────────────────────────────────────────
Table:
  LABEL | STATUS | SCOPES | LAST USED | CREATED | ACTIONS
─────────────────────────────────────────
(No pagination — keys per tenant are few; show all)
```

**Table columns:**
| Column | Render |
|---|---|
| Label | Bold text |
| Status | Badge: `Active` (success) / `Revoked` (disabled) |
| Scopes | Comma-separated tags or "—" |
| Last Used | Relative date or "Never" |
| Created | Date |
| Actions | Regenerate · Revoke/Restore · Delete |

**Reveal-Once Modal** (shown after create or regenerate):
```
Triggered by flash.new_key presence on page load.

Title: "API Key Baru — Simpan Sekarang"
Warning: "Key ini hanya ditampilkan sekali dan tidak akan bisa dilihat lagi."
Content:
  [monospace code block — full key] [Copy button]
  After copy: "Tersalin!" confirmation.
Footer: [Tutup — closes modal, key dismissed forever]
```

- Use `useEffect(() => { if (flash.new_key) setRevealOpen(true) }, [flash.new_key])`.
- Copy button: `navigator.clipboard.writeText(flash.new_key)`.
- Closing the modal clears the flash from memory (local state only, key already gone server-side).

### Create Modal

Radix `Dialog`. Fields:
- **Label** (required, e.g. "Production", "Staging")
- **Scopes** (optional, free-text or multi-select — V1: text input comma-separated)

Submit: `useForm().post(route('api-keys.store', tenantId))`.

### Revoke Confirmation

Radix `AlertDialog`:
```
"Nonaktifkan API key ini?"
"Aplikasi yang menggunakan key ini akan langsung ditolak."
[Batal] [Nonaktifkan]
```

Submit: `useForm().post(route('api-keys.revoke', keyId))`.

### Regenerate Confirmation

```
"Regenerate API key ini?"
"Key lama akan langsung tidak berlaku. Key baru akan ditampilkan sekali."
[Batal] [Regenerate]
```

---

## Verification

- [ ] Key list loads for a specific tenant.
- [ ] Create: form validates (label required). On success, reveal-once modal auto-opens with raw key.
- [ ] Copy button copies key to clipboard, shows "Tersalin!".
- [ ] Closing reveal modal → key no longer visible anywhere.
- [ ] Refreshing page after creation → key NOT shown again (flash consumed).
- [ ] Revoke: badge changes to "Revoked", actions update.
- [ ] Regenerate: confirm dialog, then reveal-once modal with new key.
- [ ] Delete: row removed.
- [ ] `key_hash` never appears in API response (check Network tab).
- [ ] `AuditLog` row for each create/revoke/regenerate/delete.
- [ ] Developer role: can only see keys for own tenant (`tenant_scope`).
