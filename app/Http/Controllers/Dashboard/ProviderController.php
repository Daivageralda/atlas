<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProviderRequest;
use App\Http\Requests\UpdateProviderRequest;
use App\Http\Resources\ProviderResource;
use App\Models\Provider;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Inertia\Inertia;

use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class ProviderController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            // Admin only middleware scope
            new Middleware(function ($request, $next) {
                if ($request->user() && !$request->user()->isAdmin()) {
                    abort(403, 'Unauthorized. Only administrators can access settings providers.');
                }
                return $next($request);
            }),
        ];
    }

    public function index()
    {
        return Inertia::render('Providers/Index', [
            'providers' => ProviderResource::collection(Provider::all())->resolve(),
        ]);
    }

    public function store(StoreProviderRequest $request)
    {
        $data = $request->validated();
        if (!empty($data['api_key_plain'])) {
            $data['api_key_encrypted'] = encrypt($data['api_key_plain']);
        }
        unset($data['api_key_plain']);

        $provider = Provider::create($data);
        AuditLogger::log($provider, 'created', [], $this->safeProviderArray($provider));

        return redirect()->route('providers.index')->with('success', 'Provider ditambahkan.');
    }

    public function update(UpdateProviderRequest $request, Provider $provider)
    {
        $before = $this->safeProviderArray($provider);
        $data = $request->validated();

        if (isset($data['api_key_plain'])) {
            if (!empty($data['api_key_plain'])) {
                $data['api_key_encrypted'] = encrypt($data['api_key_plain']);
            }
            unset($data['api_key_plain']);
        }

        $provider->update($data);
        AuditLogger::log($provider, 'updated', $before, $this->safeProviderArray($provider->fresh()));

        return redirect()->route('providers.index')->with('success', 'Provider diperbarui.');
    }

    public function destroy(Provider $provider)
    {
        if ($provider->is_active) {
            return back()->with('error', 'Provider aktif tidak dapat dihapus. Nonaktifkan terlebih dahulu.');
        }

        $before = $this->safeProviderArray($provider);
        $provider->delete();
        AuditLogger::log($provider, 'deleted', $before, []);

        return redirect()->route('providers.index')->with('success', 'Provider dihapus.');
    }

    private function safeProviderArray(Provider $provider)
    {
        return $provider->only('id', 'name', 'role', 'api_url', 'pricing_formula', 'is_active', 'config');
    }
}
