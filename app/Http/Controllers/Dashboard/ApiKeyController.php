<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreApiKeyRequest;
use App\Http\Resources\ApiKeyResource;
use App\Models\ApiKey;
use App\Models\Tenant;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ApiKeyController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Scope search query if tenant_id parameter provided
        $tenantId = $request->query('tenant_id');
        
        if ($tenantId) {
            $tenant = Tenant::findOrFail($tenantId);
            if (!$user->isAdmin() && $user->tenant_scope !== $tenant->id) {
                abort(403, 'Unauthorized.');
            }
            $keys = $tenant->apiKeys()->latest()->get();
        } else {
            // Global scope list (admin only, otherwise fallback to own tenant)
            if (!$user->isAdmin()) {
                $tenant = Tenant::findOrFail($user->tenant_scope);
                $keys = $tenant->apiKeys()->latest()->get();
                $tenantId = $tenant->id;
            } else {
                $keys = ApiKey::latest()->get();
                $tenant = null;
            }
        }

        return Inertia::render('ApiKeys/Index', [
            'tenant'  => $tenant ? $tenant->only('id', 'name') : null,
            'apiKeys' => ApiKeyResource::collection($keys),
            'tenants' => $user->isAdmin() ? Tenant::where('status', 'active')->get(['id', 'name']) : [],
        ]);
    }

    public function store(StoreApiKeyRequest $request)
    {
        $user = $request->user();
        $tenantId = $request->input('tenant_id');
        
        if (!$tenantId && !$user->isAdmin()) {
            $tenantId = $user->tenant_scope;
        }

        $tenant = Tenant::findOrFail($tenantId);
        if (!$user->isAdmin() && $user->tenant_scope !== $tenant->id) {
            abort(403, 'Unauthorized.');
        }

        // Secure Key Generation: atl_ prefix + random 48 characters
        $raw = 'atl_' . bin2hex(random_bytes(24));
        $hash = hash('sha256', $raw);
        $preview = substr($raw, 0, 8) . '...' . substr($raw, -4);

        $apiKey = $tenant->apiKeys()->create([
            'label'       => $request->label,
            'key_hash'    => $hash,
            'key_preview' => $preview,
            'scopes'      => $request->scopes ?? null,
            'status'      => 'active',
        ]);

        AuditLogger::log($apiKey, 'created', [], $apiKey->toArray());

        return redirect()
            ->route('api-keys.index')
            ->with('new_key', $raw)
            ->with('success', 'API key berhasil dibuat.');
    }

    public function revoke(Request $request, ApiKey $apiKey)
    {
        $user = $request->user();
        if (!$user->isAdmin() && $user->tenant_scope !== $apiKey->tenant_id) {
            abort(403, 'Unauthorized.');
        }

        $before = $apiKey->toArray();
        $apiKey->update(['status' => 'revoked']);
        
        AuditLogger::log($apiKey, 'updated', $before, $apiKey->fresh()->toArray());

        return back()->with('success', 'API key dinonaktifkan.');
    }

    public function regenerate(Request $request, ApiKey $apiKey)
    {
        $user = $request->user();
        if (!$user->isAdmin() && $user->tenant_scope !== $apiKey->tenant_id) {
            abort(403, 'Unauthorized.');
        }

        $raw = 'atl_' . bin2hex(random_bytes(24));
        $hash = hash('sha256', $raw);
        $preview = substr($raw, 0, 8) . '...' . substr($raw, -4);

        $before = $apiKey->toArray();
        $apiKey->update([
            'key_hash'     => $hash,
            'key_preview'  => $preview,
            'status'       => 'active',
            'last_used_at' => null
        ]);

        AuditLogger::log($apiKey, 'updated', $before, $apiKey->fresh()->toArray());

        return back()
            ->with('new_key', $raw)
            ->with('success', 'API key diperbarui.');
    }

    public function destroy(Request $request, ApiKey $apiKey)
    {
        $user = $request->user();
        if (!$user->isAdmin()) {
            abort(403, 'Only administrators can delete API keys.');
        }

        $before = $apiKey->toArray();
        $apiKey->delete();
        
        AuditLogger::log($apiKey, 'deleted', $before, []);

        return back()->with('success', 'API key dihapus.');
    }
}
