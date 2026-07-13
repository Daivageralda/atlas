<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('translation_memory', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('cache_key', 128);
            $table->string('source_lang', 10);
            $table->string('target_lang', 10);
            $table->enum('content_type', ['plain', 'html', 'markdown']);
            $table->longText('source_text');
            $table->longText('translated_text');
            $table->string('provider')->nullable();
            $table->unsignedInteger('usage_count')->default(1);
            $table->timestamps();

            $table->index(['tenant_id', 'cache_key']);
            $table->unique(['tenant_id', 'cache_key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('translation_memory');
    }
};
