<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('translation_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('api_key_id')->nullable()->constrained('api_keys')->nullOnDelete();
            $table->string('source_lang', 10);
            $table->string('target_lang', 10);
            $table->enum('content_type', ['plain', 'html', 'markdown']);
            $table->enum('status', ['success', 'failed', 'cached']);
            $table->string('provider')->nullable();
            $table->tinyInteger('retry_count')->default(0);
            $table->boolean('fallback_used')->default(false);
            $table->unsignedInteger('duration_ms')->nullable();
            $table->unsignedInteger('token_usage')->nullable();
            $table->decimal('cost_estimate', 10, 6)->nullable();
            $table->json('request_payload')->nullable();
            $table->json('response_payload')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'created_at']);
            $table->index(['status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('translation_logs');
    }
};
