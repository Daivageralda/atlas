<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('queue_jobs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type');
            $table->json('payload');
            $table->enum('status', ['pending', 'running', 'success', 'failed'])->default('pending');
            $table->tinyInteger('retry_count')->default(0);
            $table->string('qstash_message_id')->nullable();
            $table->text('error')->nullable();
            $table->timestamps();

            $table->index(['status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('queue_jobs');
    }
};
