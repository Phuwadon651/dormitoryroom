<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$result = "Check Start\n";

try {
    // Force check
    $columns = Schema::getColumnListing('tenants');
    if (in_array('plain_password', $columns)) {
        $result .= "SUCCESS: Column 'plain_password' exists.\n";
    } else {
        $result .= "FAIL: Column 'plain_password' MISSING.\n";
        // Try adding again
        try {
            DB::statement("ALTER TABLE tenants ADD COLUMN plain_password TEXT NULL");
            $result .= "ATTEMPT: Added column.\n";
        } catch(\Exception $e) {
            $result .= "ATTEMPT FAIL: " . $e->getMessage() . "\n";
        }
    }
} catch (\Exception $e) {
    $result .= "ERROR: " . $e->getMessage() . "\n";
}

file_put_contents('schema_check_result.txt', $result);
echo $result;
