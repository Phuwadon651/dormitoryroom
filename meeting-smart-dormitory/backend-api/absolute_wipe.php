<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Starting Absolute Wipe...\n";

Schema::disableForeignKeyConstraints();

$tables = [
    'meter_readings',
    'payments',
    'invoices',
    'contracts',
    'tenants',
    'rooms',
];

foreach ($tables as $table) {
    echo "- Wiping $table... ";
    DB::table($table)->truncate();
    echo "Done.\n";
}

echo "- Cleaning Users (keeping Admins)... ";
DB::table('users')->where('role', '!=', 'Admin')->delete();
echo "Done.\n";

Schema::enableForeignKeyConstraints();

echo "Wipe Complete.\n";
