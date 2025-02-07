<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Helpers\Migration as MigrationHelper;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('answers', function (Blueprint $table) {
            MigrationHelper::baseTable($table);

            $table->string('name')->nullable();
            $table->smallInteger('position')->default(0);
            $table->boolean('is_correct')->default(false);
            $table->foreignUuid('question_id')->nullable()->constrained('questions');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('answers');
    }
};
