<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\Tenant;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $users = User::with('scopedTenant')
            ->when($request->search, fn($q) => 
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
            )
            ->when($request->role, fn($q) => $q->where('role', $request->role))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Users/Index', [
            'users'   => UserResource::collection($users),
            'filters' => $request->only(['search', 'role']),
            'tenants' => Tenant::select('id', 'name')->where('status', 'active')->get()->toArray(),
        ]);
    }

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

        // Dev mock: log temp credentials to log output for verification
        Log::info("Invited user {$user->email} with temporary password: {$tempPassword}");

        AuditLogger::log($user, 'created', [], $user->only('id', 'name', 'email', 'role'));

        return redirect()->route('users.index')->with('success', 'Pengguna berhasil diundang.');
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        if ($user->id === auth()->id() && $request->role && $request->role !== 'admin') {
            return back()->with('error', 'Tidak bisa mengubah role akun Anda sendiri.');
        }

        $before = $user->only('name', 'role', 'tenant_scope', 'status');
        
        $data = $request->validated();
        if (isset($data['role']) && $data['role'] === 'admin') {
            $data['tenant_scope'] = null;
        }

        $user->update($data);

        AuditLogger::log($user, 'updated', $before, $user->fresh()->only('name', 'role', 'tenant_scope', 'status'));

        return redirect()->route('users.index')->with('success', 'Pengguna diperbarui.');
    }

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
}
