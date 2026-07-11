<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Resources\AuditLogResource;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function index(Request $request): Response
    {
        // Scope admin only
        if (!auth()->user()->isAdmin()) {
            abort(403, 'Unauthorized access to system audit logs.');
        }

        $logs = AuditLog::with('actor')
            ->when($request->entity_type, function($q) use ($request) {
                // Map classnames dynamically based on base input query strings
                $fqcn = 'App\\Models\\' . $request->entity_type;
                return $q->where('entity_type', $fqcn);
            })
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
            'entity_types' => ['Tenant', 'ApiKey', 'Provider', 'User', 'Setting'],
            'actors'       => User::select('id', 'name')->get()->toArray(),
        ]);
    }
}
