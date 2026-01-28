<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Artisan;
use App\Models\User;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Starting Strict System Wipe (Preserving Admins & Managers)...\n";

// 1. Define allowed roles to preserve
$rolesToPreserve = ['Admin', 'Manager', 'DormAdmin'];
// Or by username if roles are not reliable, but User model has 'role' field.
// We will preserve based on username as per request to keep specific accounts.
$usernamesToPreserve = ['Administrator', 'Admin', 'Manager'];

echo "Backing up User accounts: " . implode(', ', $usernamesToPreserve) . "\n";

$preservedUsers = User::whereIn('username', $usernamesToPreserve)->get()->map(function($user) {
    return $user->makeVisible(['password', 'remember_token'])->toArray();
});

if ($preservedUsers->isEmpty()) {
    echo "WARNING: No admin/manager accounts found to preserve! They will be recreated by seeder if missing.\n";
} else {
    echo "Found " . $preservedUsers->count() . " accounts to preserve.\n";
}

// 2. Identify DB Path (SQLite)
$dbPath = config('database.connections.sqlite.database');
echo "Target DB: $dbPath\n";

if (!file_exists($dbPath)) {
    echo "ERROR: DB file not found. Creating new...\n";
    touch($dbPath);
}

// 3. Truncate Tables
// We use truncate to reset IDs (autoincrement) usually, but in SQLite we might need DELETE + specific sequence reset if we want ID 1 again.
// Since we are nuke-ing, let's just use the nuke approach from before if it worked, or manual truncation if we want to be safer about file locks.
// The user wants '0 rooms', so total wipe is good.

Schema::disableForeignKeyConstraints();

$tables = Schema::getConnection()->getDoctrineSchemaManager()->listTableNames();
foreach ($tables as $table) {
    if ($table == 'migrations') continue;
    if ($table == 'sqlite_sequence') continue; // Don't truncate sequence manually usually handled by delete

    DB::table($table)->truncate();
    echo "  - Truncated: $table\n";
}

Schema::enableForeignKeyConstraints();

// 4. Restore Preserved Users
echo "Restoring Preserved Users...\n";
foreach ($preservedUsers as $userData) {
    // Check if exists (shouldn't since we truncated)
    if (!User::where('username', $userData['username'])->exists()) {
        try {
            User::create($userData);
            echo "    + Restored: {$userData['username']}\n";
        } catch (\Exception $e) {
            echo "    x Failed to restore {$userData['username']}: " . $e->getMessage() . "\n";
        }
    }
}

echo "Strict Wip Complete. System is clean.\n";
