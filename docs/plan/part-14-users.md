# Part 14 — Users

> **Status**: `[ ]`
> **Depends on**: Part 04 (AppLayout), Part 02 (AuditLogger), Part 06 (Tenants for scope select)
> **Blocks**: Nothing

---

## Goal

Admin manages dashboard users: list, invite (by email), assign role + tenant scope, deactivate/reactivate.

---

## Backend

### `UserController` (`app/Http/Controllers/Dashboard/UserController.php`)

```php
// index
public function index(Request $request)
{
    $users = User::with('scopedTenant')
        ->when($request->search, fn($q) => $q->where('name', 'like', "%{$request->search}%")
                                             ->orWhere('email', 'like', "%{$request->search}%"))
        ->when($request->role, fn($q) => $q->where('role', $request->role))
        ->latest()
        ->paginate(20)
        ->withQueryString();

    return Inertia::render('Users/Index', [
        'users'   => UserResource::collection($users),
        'filters' => $request->only(['search', 'role']),
        'tenants' => Tenant::select('id', 'name')->where('status', 'active')->get(),
    ]);
}

// store — invite: create user with temp password, send welcome email
public function store(StoreUserRequest $request)
{
    $tempPassword = Str::random(16);

    $user = User::create([
        'name'         => $request->name,
        'email'        => $request->email,
        'password'     => Hash::make($tempPassword),
        'role'         => $request->role,
        'tenant_scope' => $request->role === 'developer' ? $request->tenant_scope : null,
        'status'       => 'active',
    ]);

    // Send invite email (Mail::to($user)->send(new UserInvite($user, $tempPassword)))
    // In V1: log the temp password to Laravel log for dev purposes if mail not configured
    \Log::info("Invited user {$user->email} with temp password: {$tempPassword}");

    AuditLogger::log($user, 'created', [], $user->only('id', 'name', 'email', 'role'));

    return redirect()->route('users.index')->with('success', 'Pengguna berhasil diundang.');
}

// update — role/scope/status change
public function update(UpdateUserRequest $request, User $user)
{
    // Prevent admin from demoting themselves
    if ($user->id === auth()->id() && $request->role !== 'admin') {
        return back()->with('error', 'Tidak bisa mengubah role akun sendiri.');
    }

    $before = $user->only('name', 'role', 'tenant_scope', 'status');
    $user->update($request->validated());
    AuditLogger::log($user, 'updated', $before, $user->fresh()->only('name', 'role', 'tenant_scope', 'status'));

    return redirect()->route('users.index')->with('success', 'Pengguna diperbarui.');
}

// destroy — deactivate, don't hard delete
public function destroy(User $user)
{
    if ($user->id === auth()->id()) {
        return back()->with('error', 'Tidak bisa menonaktifkan akun sendiri.');
    }

    $before = $user->only('status');
    $user->update(['status' => 'inactive']);
    AuditLogger::log($user, 'updated', $before, ['status' => 'inactive']);

    return back()->with('success', 'Pengguna dinonaktifkan.');
}
```

### Validation

`StoreUserRequest`: `name` required|string, `email` required|email|unique:users, `role` required|in:admin,developer, `tenant_scope` required_if:role,developer|exists:tenants,id.

`UpdateUserRequest`: same but `sometimes`, email unique ignoring self.

### `UserResource`

Returns: `id, name, email, role, tenant_scope_name, status, created_at`.

---

## Frontend

### `Pages/Users/Index.jsx`

```
Header: <h1>Users</h1>                           [+ Invite User — primary]

Filter bar:
  [Search name/email]   [Role: All/Admin/Developer]

Table:
  NAME | EMAIL | ROLE | TENANT SCOPE | STATUS | SINCE | ACTIONS
```

**Table columns:**
| Column | Render |
|---|---|
| Name | Bold |
| Email | Secondary color |
| Role | Badge: `Admin` (accent) · `Developer` (info) |
| Tenant Scope | Tenant name or "All" (admin) |
| Status | Badge: `Active` (success) · `Inactive` (disabled) |
| Since | Relative date |
| Actions | Edit · Deactivate/Reactivate |

**Cannot deactivate self** — Actions column shows disabled state for current user row, tooltip "Tidak bisa menonaktifkan akun sendiri."

### Invite Modal

Radix `Dialog`. Fields:
- **Name** (required)
- **Email** (required, email)
- **Role** (select: Admin / Developer)
- **Tenant Scope** (conditional: shown only when role = Developer, select from active tenants)

On role change to Admin: hide tenant scope field, set value to null.

### Edit Modal

Same fields as invite, pre-populated. Email readonly on edit (changing email is out of scope V1).

### Deactivate Confirmation

```
"Nonaktifkan [Name]?"
"Pengguna tidak akan bisa login. Aksi ini dapat dibatalkan."
[Batal] [Nonaktifkan]
```

---

## Verification

- [ ] User list loads with pagination.
- [ ] Search filters by name or email.
- [ ] Role filter works.
- [ ] Invite: developer role shows tenant scope field. Admin hides it.
- [ ] Invite: duplicate email → validation error.
- [ ] Invited user appears in list with `Active` status.
- [ ] Edit: role change from developer to admin clears `tenant_scope`.
- [ ] Deactivate: status badge changes to `Inactive`.
- [ ] Deactivating self: button disabled, tooltip shows.
- [ ] Reactivate: update via edit modal, set status to active.
- [ ] `AuditLog` row on create, update (includes role change), deactivate.
- [ ] Admin-only page: developer role → 403 (add `CheckRole::class` middleware or policy).
