<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Response;

Route::get('/', function () {
    return view('welcome');
});

// Fallback routes removed as filesystem is now configured for direct access

// Temporary Fix Route - Nuclear Option accessible via Web
Route::get('/fix-db', function () {
    try {
        $pdo = DB::connection()->getPdo();
        $dbName = DB::connection()->getDatabaseName();
        $output = "<html><body><h1>Database Fix Tool</h1>";
        $output .= "<p><strong>Target Database:</strong> " . $dbName . "</p>";
        
        // 1. DROP
        Schema::dropIfExists('settings');
        $output .= "<p>✅ Dropped 'settings' table.</p>";
        
        // 2. CREATE
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key');
            $table->text('value')->nullable();
            $table->string('group')->default('general');
            $table->string('type')->default('string'); // The missing column
            $table->timestamps();
        });
        $output .= "<p>✅ Created 'settings' table with 'type' column.</p>";
        
        // 3. SEED
        $now = now();
        DB::table('settings')->insert([
            ['key' => 'dorm_name', 'value' => 'Smart Dormitory', 'group' => 'general', 'type' => 'string', 'created_at' => $now, 'updated_at' => $now],
            ['key' => 'water_unit_price', 'value' => '18', 'group' => 'finance', 'type' => 'number', 'created_at' => $now, 'updated_at' => $now],
            ['key' => 'electric_unit_price', 'value' => '8', 'group' => 'finance', 'type' => 'number', 'created_at' => $now, 'updated_at' => $now],
            ['key' => 'common_fee', 'value' => '300', 'group' => 'finance', 'type' => 'number', 'created_at' => $now, 'updated_at' => $now],
        ]);
        $output .= "<p>✅ Seeded default data (Water: 18, Electric: 8, Common: 300).</p>";
        
        $output .= "<h2>SUCCESS! Repair Complete.</h2>";
        $output .= "<p>You can now go back to the app and try saving/invoicing.</p>";
        $output .= "</body></html>";
        
        return $output;
    } catch (\Exception $e) {
        return "<html><body><h1>ERROR</h1><p>" . $e->getMessage() . "</p></body></html>";
    }
});
