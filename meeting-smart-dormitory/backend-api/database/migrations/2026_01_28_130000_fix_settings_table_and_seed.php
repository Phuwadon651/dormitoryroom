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
        // 1. Ensure 'type' column exists
        Schema::table('settings', function (Blueprint $table) {
            if (!Schema::hasColumn('settings', 'type')) {
                $table->string('type')->default('string')->nullable()->after('group');
            }
        });

        // 2. Ensure 'group' column exists (just in case)
        Schema::table('settings', function (Blueprint $table) {
            if (!Schema::hasColumn('settings', 'group')) {
                $table->string('group')->default('general')->after('value');
            }
        });

        // 3. Seed default data if missing
        $defaults = [
            ['key' => 'water_unit_price', 'value' => '18', 'group' => 'finance', 'type' => 'number'],
            ['key' => 'electric_unit_price', 'value' => '8', 'group' => 'finance', 'type' => 'number'],
            ['key' => 'common_fee', 'value' => '300', 'group' => 'general', 'type' => 'number'],
            ['key' => 'dorm_name', 'value' => 'SmartDorm', 'group' => 'general', 'type' => 'string'],
        ];

        foreach ($defaults as $default) {
            $exists = DB::table('settings')->where('key', $default['key'])->exists();
            if (!$exists) {
                DB::table('settings')->insert([
                    'key' => $default['key'],
                    'value' => $default['value'],
                    'group' => $default['group'],
                    'type' => $default['type'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } else {
                // Determine if we need to update the group/type for existing keys to be correct
                DB::table('settings')->where('key', $default['key'])->update([
                    'group' => $default['group'],
                    'type' => $default['type']
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No down action needed as we want to keep these fixes
    }
};
