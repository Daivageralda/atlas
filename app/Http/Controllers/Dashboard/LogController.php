<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Resources\TranslationLogDetailResource;
use App\Http\Resources\TranslationLogResource;
use App\Models\Tenant;
use App\Models\TranslationLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LogController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        $query = TranslationLog::with(['tenant', 'apiKey'])
            ->when($request->tenant_id, fn($q) => $q->where('tenant_id', $request->tenant_id))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->provider, fn($q) => $q->where('provider', $request->provider))
            ->when($request->date_from, fn($q) => $q->whereDate('created_at', '>=', $request->date_from))
            ->when($request->date_to, fn($q) => $q->whereDate('created_at', '<=', $request->date_to))
            ->when($request->search, fn($q) => $q->where('id', 'like', "%{$request->search}%"));

        // Scope developer role users to their respective tenant parameters only
        if (!$user->isAdmin()) {
            $query->where('tenant_id', $user->tenant_scope);
        }

        $logs = $query->latest()->paginate(50)->withQueryString();

        return Inertia::render('Logs/Index', [
            'logs' => TranslationLogResource::collection($logs),
            'filters' => $request->only(['tenant_id', 'status', 'provider', 'date_from', 'date_to', 'search']),
            'tenants' => $user->isAdmin()
                ? Tenant::select('id', 'name')->get()->toArray()
                : [],
        ]);
    }

    public function show(Request $request, string $id)
    {
        $user = $request->user();
        $log = TranslationLog::with(['tenant', 'apiKey'])->findOrFail($id);

        if (!$user->isAdmin() && $log->tenant_id !== $user->tenant_scope) {
            abort(403, 'Unauthorized access to target logs.');
        }

        return Inertia::render('Logs/Show', [
            'log' => (new TranslationLogDetailResource($log))->resolve(),
        ]);
    }
}
