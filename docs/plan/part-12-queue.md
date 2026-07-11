# Part 12 — Queue

> **Status**: `[ ]`
> **Depends on**: Part 01 (queue_jobs table), Part 02 (QStash callback route)
> **Blocks**: Nothing directly (Part 09 is sync in V1; QStash used for retries/batch in V2)

---

## Goal

Integrate Upstash QStash for async background jobs. Dispatch jobs via HTTP to QStash, handle signed callbacks, track status in `queue_jobs`, and expose a monitoring UI with manual retry.

---

## Backend

### `QStashService` (`app/Services/QStashService.php`)

```php
<?php

namespace App\Services;

use App\Models\QueueJob;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class QStashService
{
    private string $token;
    private string $qstashUrl;
    private string $callbackUrl;

    public function __construct()
    {
        $this->token       = config('services.qstash.token');
        $this->qstashUrl   = config('services.qstash.url', 'https://qstash.upstash.io');
        $this->callbackUrl = config('app.url') . '/api/v1/queue/callback';
    }

    public function dispatch(string $type, array $payload): QueueJob
    {
        $job = QueueJob::create([
            'id'      => Str::ulid(),
            'type'    => $type,
            'payload' => $payload,
            'status'  => 'pending',
        ]);

        $response = Http::withToken($this->token)
            ->post("{$this->qstashUrl}/v2/publish/{$this->callbackUrl}", [
                'body' => json_encode([
                    'job_id'  => $job->id,
                    'type'    => $type,
                    'payload' => $payload,
                ]),
            ]);

        if ($response->successful()) {
            $job->update(['qstash_message_id' => $response->json('messageId')]);
        } else {
            $job->update(['status' => 'failed', 'error' => 'QStash dispatch failed: ' . $response->body()]);
        }

        return $job;
    }
}
```

### `QueueCallbackController` (`app/Http/Controllers/Queue/QueueCallbackController.php`)

```php
public function handle(Request $request)
{
    // Verify QStash signature
    $signature       = $request->header('Upstash-Signature');
    $signingKey      = config('services.qstash.current_signing_key');
    $nextSigningKey  = config('services.qstash.next_signing_key');

    if (!$this->verifySignature($request->getContent(), $signature, $signingKey, $nextSigningKey)) {
        return response()->json(['error' => 'Invalid signature'], 401);
    }

    $body  = $request->json()->all();
    $jobId = $body['job_id'] ?? null;
    $job   = $jobId ? QueueJob::find($jobId) : null;

    if (!$job) {
        return response()->json(['error' => 'Job not found'], 404);
    }

    $job->update(['status' => 'running']);

    try {
        $this->processJob($job->type, $job->payload);
        $job->update(['status' => 'success']);
    } catch (\Exception $e) {
        $job->update(['status' => 'failed', 'error' => $e->getMessage(), 'retry_count' => $job->retry_count + 1]);
    }

    return response()->json(['ok' => true]);
}

private function verifySignature(string $body, ?string $signature, string $current, string $next): bool
{
    // HMAC-SHA256 verification per QStash docs
    // Try both current and next signing key (key rotation)
    foreach ([$current, $next] as $key) {
        $expected = base64_encode(hash_hmac('sha256', $body, $key, true));
        if (hash_equals($expected, $signature ?? '')) return true;
    }
    return false;
}

private function processJob(string $type, array $payload)
{
    match($type) {
        'retry_translation' => app(TranslationRetryJob::class)->handle($payload),
        default             => throw new \InvalidArgumentException("Unknown job type: {$type}"),
    };
}
```

### Manual Retry (`QueueController`)

```php
public function retry(QueueJob $job)
{
    if (!in_array($job->status, ['failed'])) {
        return back()->with('error', 'Hanya job yang gagal yang bisa di-retry.');
    }

    app(QStashService::class)->dispatch($job->type, $job->payload);

    return back()->with('success', 'Job di-dispatch ulang ke queue.');
}
```

### Config (`config/services.php`)

```php
'qstash' => [
    'token'               => env('QSTASH_TOKEN'),
    'url'                 => env('QSTASH_URL', 'https://qstash.upstash.io'),
    'current_signing_key' => env('QSTASH_CURRENT_SIGNING_KEY'),
    'next_signing_key'    => env('QSTASH_NEXT_SIGNING_KEY'),
],
```

---

## Frontend

### `Pages/Queue/Index.jsx`

```
Header: <h1>Queue Monitor</h1>

Summary row: [N pending] [N running] [N success] [N failed]

Table:
  JOB ID | TYPE | STATUS | RETRIES | CREATED | UPDATED | ACTIONS
```

**Table columns:**
| Column | Render |
|---|---|
| Job ID | Monospace, truncated 8 chars |
| Type | Tag/badge |
| Status | Badge: `pending` (warning) · `running` (info pulse) · `success` (success) · `failed` (danger) |
| Retries | Number |
| Created | Relative date |
| Updated | Relative date |
| Actions | Retry button (only shown for `failed` status) |

**Running status badge**: subtle pulse animation (`animate-pulse`) to indicate in-progress. Reduced motion: static badge.

**Manual Retry**: `useForm().post(route('queue.retry', job.id))`. Shows confirmation before retrying.

**Auto-refresh**: every 15s, `router.reload({ only: ['jobs'] })` via `useEffect` + `setInterval`.

---

## Verification

- [ ] `QStashService::dispatch()` creates a `queue_jobs` row with `status: pending`.
- [ ] `QStashService::dispatch()` sends HTTP POST to QStash with correct payload.
- [ ] Callback endpoint: invalid signature → 401.
- [ ] Callback endpoint: valid signature → job `status` updated to `running` then `success`.
- [ ] Callback exception → job `status: failed`, `error` message saved, `retry_count` incremented.
- [ ] Manual retry: only available for `failed` jobs.
- [ ] Manual retry: dispatches new QStash message.
- [ ] Queue UI: all 4 statuses visible with correct badge colors.
- [ ] Running badge: animated pulse.
- [ ] Auto-refresh every 15s without full page reload.
- [ ] `QSTASH_TOKEN` not exposed in Inertia props or frontend JS.
