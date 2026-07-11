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
        $this->qstashUrl   = rtrim(config('services.qstash.url', 'https://qstash.upstash.io'), '/');
        $this->callbackUrl = rtrim(config('app.url'), '/') . '/api/v1/queue/callback';
    }

    public function dispatch(string $type, array $payload): QueueJob
    {
        $job = QueueJob::create([
            'id'      => Str::ulid()->toBase32(),
            'type'    => $type,
            'payload' => $payload,
            'status'  => 'pending',
            'retry_count' => 0,
        ]);

        $response = Http::withHeaders([
            'Authorization' => "Bearer {$this->token}",
            'Content-Type'  => 'application/json',
        ])
        ->timeout(15)
        ->post("{$this->qstashUrl}/v2/publish/{$this->callbackUrl}", [
            'job_id'  => $job->id,
            'type'    => $type,
            'payload' => $payload,
        ]);

        if ($response->successful()) {
            $job->update(['qstash_message_id' => $response->json('messageId')]);
        } else {
            $job->update([
                'status' => 'failed',
                'error' => 'QStash dispatch failed: ' . $response->status() . ' - ' . $response->body()
            ]);
        }

        return $job;
    }
}
