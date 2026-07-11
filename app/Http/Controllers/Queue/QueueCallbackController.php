<?php

namespace App\Http\Controllers\Queue;

use App\Http\Controllers\Controller;
use App\Models\QueueJob;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class QueueCallbackController extends Controller
{
    public function handle(Request $request): JsonResponse
    {
        $signature      = $request->header('Upstash-Signature');
        $signingKey     = config('services.qstash.current_signing_key');
        $nextSigningKey = config('services.qstash.next_signing_key');

        // Verify incoming request signature
        if (!$this->verifySignature($request->getContent(), $signature, $signingKey, $nextSigningKey)) {
            Log::warning('[QStash Callback] Invalid signature payload authentication.');
            return response()->json(['error' => 'Invalid signature'], 401);
        }

        $body  = $request->json()->all();
        $jobId = $body['job_id'] ?? null;
        $job   = $jobId ? QueueJob::find($jobId) : null;

        if (!$job) {
            return response()->json(['error' => 'Queue job entry not found'], 404);
        }

        $job->update(['status' => 'running']);

        try {
            $this->processJob($job->type, $job->payload);
            $job->update([
                'status' => 'success',
                'error' => null // Clear old dispatch error messages
            ]);
        } catch (\Exception $e) {
            $job->update([
                'status' => 'failed',
                'error' => $e->getMessage(),
                'retry_count' => $job->retry_count + 1
            ]);
        }

        return response()->json(['ok' => true]);
    }

    private function verifySignature(string $body, ?string $signature, ?string $current, ?string $next): bool
    {
        if (config('app.env') === 'local') {
            return true;
        }

        if (empty($signature)) {
            return false;
        }

        // HMAC verification using current and fallback rotated keys
        foreach (array_filter([$current, $next]) as $key) {
            $expected = base64_encode(hash_hmac('sha256', $body, $key, true));
            if (hash_equals($expected, $signature)) {
                return true;
            }
        }
        return false;
    }

    private function processJob(string $type, array $payload): void
    {
        match ($type) {
            'retry_translation' => $this->executeRetryTranslation($payload),
            default => throw new \InvalidArgumentException("Unknown background job type: {$type}"),
        };
    }

    private function executeRetryTranslation(array $payload): void
    {
        // Custom background retry execution task logic
        Log::info('[QStash Callback] Executing retry_translation task', $payload);
    }
}
