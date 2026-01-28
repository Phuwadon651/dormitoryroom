<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Checking schema...\n";

try {
    DB::table('tenants')->select('plain_password')->first();
    echo "Column 'plain_password' already exists.\n";
} catch (\Exception $e) {
    echo "Column 'plain_password' missing. Adding it...\n";
    try {
        // SQLite syntax
        DB::statement("ALTER TABLE tenants ADD COLUMN plain_password TEXT NULL");
        echo "Column added successfully.\n";
    } catch (\Exception $ex) {
        echo "Failed to add column: " . $ex->getMessage() . "\n";
    }
}
