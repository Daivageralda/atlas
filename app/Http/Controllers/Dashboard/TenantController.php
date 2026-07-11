<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTenantRequest;
use App\Http\Requests\UpdateTenantRequest;
use App\Http\Resources\ApiKeyResource;
use App\Http\Resources\TenantDetailResource;
use App\Http\Resources\TenantResource;
use App\Models\Tenant;
use App\Models\TranslationLog;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TenantController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $tenants = Tenant::query()
            ->when(!$user->isAdmin(), function ($q) use ($user) {
                // If developer role, bound by user scope
                return $q->where('id', $user->tenant_scope);
            })
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

    public function store(StoreTenantRequest $request)
    {
        $tenant = Tenant::create($request->validated());
        
        AuditLogger::log($tenant, 'created', [], $tenant->toArray());

        return redirect()->route('tenants.index')->with('success', 'Tenant berhasil dibuat.');
    }

    public function show(Request $request, Tenant $tenant)
    {
        $user = $request->user();
        if (!$user->isAdmin() && $user->tenant_scope !== $tenant->id) {
            abort(403, 'Unauthorized.');
        }

        return Inertia::render('Tenants/Show', [
            'tenant'   => (new TenantDetailResource($tenant))->resolve(),
            'apiKeys'  => ApiKeyResource::collection($tenant->apiKeys()->latest()->get()),
            'overview' => [
                'total_translations' => TranslationLog::where('tenant_id', $tenant->id)->count(),
                'total_cost'         => (float) TranslationLog::where('tenant_id', $tenant->id)->sum('cost_estimate'),
                'cache_hit_count'    => TranslationLog::where('tenant_id', $tenant->id)->where('status', 'cached')->count(),
            ],
        ]);
    }

    public function update(UpdateTenantRequest $request, Tenant $tenant)
    {
        $user = $request->user();
        if (!$user->isAdmin() && $user->tenant_scope !== $tenant->id) {
            abort(403, 'Unauthorized.');
        }

        $before = $tenant->toArray();
        $tenant->update($request->validated());
        
        AuditLogger::log($tenant, 'updated', $before, $tenant->fresh()->toArray());

        return redirect()->route('tenants.show', $tenant->id)->with('success', 'Tenant diperbarui.');
    }

    public function destroy(Request $request, Tenant $tenant)
    {
        $user = $request->user();
        if (!$user->isAdmin()) {
            abort(403, 'Only administrators can delete tenants.');
        }

        $before = $tenant->toArray();
        $tenant->delete();
        
        AuditLogger::log($tenant, 'deleted', $before, []);

        return redirect()->route('tenants.index')->with('success', 'Tenant dihapus.');
    }
}
