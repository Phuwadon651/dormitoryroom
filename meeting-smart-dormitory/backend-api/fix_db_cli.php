<?php
// Fix DB Script
$dbPath = __DIR__ . '/database/database_v2.sqlite';
echo "Target DB: $dbPath\n";

if (!file_exists($dbPath)) {
    die("Error: DB file not found.\n");
}

try {
    $pdo = new PDO('sqlite:' . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec("PRAGMA busy_timeout = 5000;"); // Wait up to 5s for locks

    // Check columns
    $stmt = $pdo->query("PRAGMA table_info(tenants)");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $found = false;
    foreach ($columns as $col) {
        if ($col['name'] === 'plain_password') {
            $found = true;
            break;
        }
    }

    if (!$found) {
        echo "Column missing. Adding...\n";
        $pdo->exec("ALTER TABLE tenants ADD COLUMN plain_password TEXT NULL");
        echo "SUCCESS: Column 'plain_password' added.\n";
    } else {
        echo "INFO: Column already exists.\n";
    }

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
