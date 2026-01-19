<?php
use Illuminate\Database\Capsule\Manager as Capsule;

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $pdo = \Illuminate\Support\Facades\DB::connection()->getPdo();
    echo "Connected to database.\n";
    
    // Check if column exists
    $columns = $pdo->query("PRAGMA table_info(tenants)")->fetchAll(PDO::FETCH_ASSOC);
    $exists = false;
    foreach ($columns as $col) {
        if ($col['name'] === 'user_id') {
            $exists = true;
            break;
        }
    }
    
    if (!$exists) {
        echo "Adding user_id column...\n";
        $pdo->exec("ALTER TABLE tenants ADD COLUMN user_id INTEGER DEFAULT NULL");
        echo "Column user_id added successfully.\n";
    } else {
        echo "Column user_id already exists.\n";
    }
    
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
