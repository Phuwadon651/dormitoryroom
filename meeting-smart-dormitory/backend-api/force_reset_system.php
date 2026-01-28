<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Models\User;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Starting System Wide Reset...\n";

Schema::disableForeignKeyConstraints();

// 1. Truncate operational tables
echo "- Clearing Meter Readings...\n";
DB::table('meter_readings')->truncate();

echo "- Clearing Payments...\n";
DB::table('payments')->truncate();

echo "- Clearing Invoices...\n";
DB::table('invoices')->truncate();

echo "- Clearing Contracts...\n";
DB::table('contracts')->truncate();

echo "- Clearing Tenants...\n";
DB::table('tenants')->truncate();

echo "- Clearing Rooms...\n";
DB::table('rooms')->truncate();

// 2. Clean Users (Keep Admins)
echo "- Cleaning non-Admin Users...\n";
// Delete users who are NOT Admin (assuming 'Admin' is the role string)
// If there are multiple admins, this keeps them all.
DB::table('users')->where('role', '!=', 'Admin')->delete();

Schema::enableForeignKeyConstraints();

echo "System Reset Complete. All non-admin data cleared.\n";
