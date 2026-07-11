<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\QueueJob;
use App\Services\QStashService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QueueController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $query = QueueJob::query();

        // Scope check for non-admin users
        if (!$user->isAdmin()) {
            // Developers see jobs dispatched by their specific tenant
            $query->whereJsonContains('payload->tenant_id', $user->tenant_scope);
        }

        $jobs = $query->latest('created_at')->paginate(30)->withQueryString();

        // Status counts for bento KPI indicators
        $counts = [
            'pending' => (clone $query)->where('status', 'pending')->count(),
            'running' => (clone $query)->where('status', 'running')->count(),
            'success' => (clone $query)->where('status', 'success')->count(),
            'failed'  => (clone $query)->where('status', 'failed')->count(),
        ];

        return Inertia::render('Queue/Index', [
            'jobs' => $jobs,
            'counts' => $counts,
        ]);
    }

    public function retry(QueueJob $job): RedirectResponse
    {
        if ($job->status !== 'failed') {
            return back()->with('error', 'Hanya job yang gagal yang dapat di-retry.');
        }

        app(QStashService::class)->dispatch($job->type, $job->payload);

        return back()->with('success', 'Job berhasil dikirim ulang ke queue.');
    }
}
