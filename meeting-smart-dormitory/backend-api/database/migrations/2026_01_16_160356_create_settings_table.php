<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('group')->index(); // general, finance, notification
            $table->string('type')->default('string');
            $table->timestamps();
        });

        // Seed default values inline to ensure availability immediately
        DB::table('settings')->insert([
            ['key' => 'dorm_name', 'value' => 'หอพักตัวอย่าง', 'group' => 'general', 'type' => 'string', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'dorm_address', 'value' => '', 'group' => 'general', 'type' => 'string', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'dorm_phone', 'value' => '', 'group' => 'general', 'type' => 'string', 'created_at' => now(), 'updated_at' => now()],
            
            ['key' => 'water_unit_price', 'value' => '18', 'group' => 'finance', 'type' => 'number', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'electric_unit_price', 'value' => '8', 'group' => 'finance', 'type' => 'number', 'created_at' => now(), 'updated_at' => now()],
            
            ['key' => 'line_notify_token', 'value' => '', 'group' => 'notification', 'type' => 'string', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'enable_email_notify', 'value' => '0', 'group' => 'notification', 'type' => 'boolean', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
