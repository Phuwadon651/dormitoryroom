<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

$output = "";
$output .= "Laravel Environment: " . app()->environment() . "\n";
$output .= "Database Connection: " . config('database.default') . "\n";
$output .= "Database Path (Config): " . config('database.connections.sqlite.database') . "\n";

try {
    $pdo = DB::connection()->getPdo();
    // For SQLite, trying to get the absolute path
    $dbPath = config('database.connections.sqlite.database');
    $output .= "Confirmed Config DB Path: $dbPath\n";
    if (file_exists($dbPath)) {
        $output .= "DB File Size: " . filesize($dbPath) . " bytes\n";
    } else {
        $output .= "WARNING: DB File DOES NOT EXIST at config path!\n";
    }
} catch (\Exception $e) {
    $output .= "PDO Error: " . $e->getMessage() . "\n";
}

$output .= "\n--- Schema Check: settings ---\n";
if (Schema::hasTable('settings')) {
    $columns = Schema::getColumnListing('settings');
    $output .= "Columns: " . implode(', ', $columns) . "\n";
    
    $output .= "Has 'type' column? " . (Schema::hasColumn('settings', 'type') ? 'YES' : 'NO') . "\n";
    $output .= "Has 'group' column? " . (Schema::hasColumn('settings', 'group') ? 'YES' : 'NO') . "\n";
    
    $output .= "\n--- Content Check (First 5 rows) ---\n";
    $rows = DB::table('settings')->take(5)->get();
    foreach ($rows as $row) {
        $output .= json_encode($row) . "\n";
    }
} else {
    $output .= "Table 'settings' does NOT exist.\n";
}

file_put_contents('debug_result.txt', $output);
echo "Done writing to debug_result.txt";
