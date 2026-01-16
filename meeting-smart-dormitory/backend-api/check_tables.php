<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

echo "Database: " . config('database.connections.sqlite.database') . "\n";

$tables = DB::select("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;");
echo "Tables found:\n";
foreach ($tables as $table) {
    echo "- " . $table->name . "\n";
}

if (Schema::hasTable('personal_access_tokens')) {
    echo "\nVERDICT: personal_access_tokens EXISTS via Schema::hasTable\n";
} else {
    echo "\nVERDICT: personal_access_tokens DOES NOT EXIST via Schema::hasTable\n";
}
