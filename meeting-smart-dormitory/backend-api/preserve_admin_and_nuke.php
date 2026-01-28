<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Artisan;
use App\Models\User;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Starting Nuclear Reset (Preserving Admin)...\n";

// 1. Retrieve all System Users (Admin, DormAdmin, Manager)
$preservedRoles = ['Admin', 'DormAdmin', 'Manager'];
$systemUsers = User::whereIn('role', $preservedRoles)->get();

if ($systemUsers->isEmpty()) {
    echo "WARNING: No System users found (Admin/DormAdmin/Manager). Proceeding with wipe (Seeders will likely recreate them).\n";
} else {
    echo "Found " . $systemUsers->count() . " system users to preserve.\n";
}

$preservedData = [];
foreach ($systemUsers as $user) {
    $preservedData[] = $user->makeVisible(['password', 'remember_token'])->toArray();
    echo " - Preserving: {$user->name} ({$user->role})\n";
}

// 2. Identify DB Path
$dbPath = config('database.connections.sqlite.database');
echo "Target DB: $dbPath\n";

if (!file_exists($dbPath)) {
    echo "ERROR: DB file not found at $dbPath\n";
    exit(1);
}

// 3. Close Connection & Delete DB
DB::disconnect();
// Force garbage collection to hopefully release file handles
gc_collect_cycles();

echo "Deleting DB file...\n";
if (!unlink($dbPath)) {
    echo "WARNING: Could not delete file (maybe locked). Attempting truncation instead...\n";
    // Fallback if file is locked
    Schema::disableForeignKeyConstraints();
    foreach(Schema::getConnection()->getDoctrineSchemaManager()->listTableNames() as $table) {
        if ($table == 'migrations') continue;
        DB::table($table)->truncate();
        echo "Truncated $table\n";
    }
    Schema::enableForeignKeyConstraints();
} else {
    // 4. Recreate Empty DB
    touch($dbPath);
    echo "Created new empty DB file.\n";

    // 5. Migrate
    echo "Running Migrations...\n";
    Artisan::call('migrate', ['--force' => true]);
    echo Artisan::output();
}

// 6. Restore Admin
// 6. Restore System Users
echo "Restoring System Users...\n";
foreach ($preservedData as $userData) {
    User::create($userData);
    echo " - Restored: {$userData['name']}\n";
}

echo "Nuclear Reset Complete.\n";
