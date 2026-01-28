<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Ensure table exists
        if (!Schema::hasTable('settings')) {
            Schema::create('settings', function (Blueprint $table) {
                $table->id();
                $table->string('key');
                $table->text('value')->nullable();
                $table->string('group')->default('general');
                $table->string('type')->default('string');
                $table->timestamps();
            });
        } else {
            // Ensure columns exist
            Schema::table('settings', function (Blueprint $table) {
                if (!Schema::hasColumn('settings', 'type')) {
                    $table->string('type')->default('string')->nullable();
                }
                if (!Schema::hasColumn('settings', 'group')) {
                    $table->string('group')->default('general')->nullable();
                }
            });
        }
    }

    public function down(): void
    {
        // Do nothing
    }
};
