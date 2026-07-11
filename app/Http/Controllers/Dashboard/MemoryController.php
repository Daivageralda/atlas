<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateMemoryRequest;
use App\Http\Resources\MemoryResource;
use App\Models\Tenant;
use App\Models\TranslationMemory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MemoryController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = TranslationMemory::with('tenant')
            ->when($request->tenant_id, fn($q) => $q->where('tenant_id', $request->tenant_id))
            ->when($request->source_lang, fn($q) => $q->where('source_lang', $request->source_lang))
            ->when($request->target_lang, fn($q) => $q->where('target_lang', $request->target_lang))
            ->when($request->search, fn($q) =>
                $q->where('source_text', 'like', "%{$request->search}%")
                  ->orWhere('translated_text', 'like', "%{$request->search}%")
            );

        // Developer scope checks
        if (!$user->isAdmin()) {
            $query->where('tenant_id', $user->tenant_scope);
        }

        $entries = $query->latest('updated_at')->paginate(30)->withQueryString();

        return Inertia::render('Memory/Index', [
            'entries' => MemoryResource::collection($entries),
            'filters' => $request->only(['tenant_id', 'source_lang', 'target_lang', 'search']),
            'tenants' => $user->isAdmin()
                ? Tenant::select('id', 'name')->get()->toArray()
                : [],
        ]);
    }

    public function update(UpdateMemoryRequest $request, TranslationMemory $memory)
    {
        $user = $request->user();

        if (!$user->isAdmin() && $memory->tenant_id !== $user->tenant_scope) {
            abort(403, 'Unauthorized access to translation memory entry.');
        }

        $memory->update([
            'translated_text' => $request->translated_text
        ]);

        return back()->with('success', 'Entri translation memory diperbarui.');
    }
}
