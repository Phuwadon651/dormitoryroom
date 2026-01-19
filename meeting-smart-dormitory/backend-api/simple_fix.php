<?php
$dbPath = __DIR__ . '/database/database_v2.sqlite';
try {
    if (!file_exists($dbPath)) {
        die("Database file not found at $dbPath\n");
    }
    $pdo = new PDO('sqlite:' . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "Connected to $dbPath\n";
    
    // Check if column exists
    $stmt = $pdo->query("PRAGMA table_info(tenants)");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $exists = false;
    foreach ($columns as $col) {
        if ($col['name'] === 'user_id') {
            $exists = true;
            break;
        }
    }
    
    if (!$exists) {
        $pdo->exec("ALTER TABLE tenants ADD COLUMN user_id INTEGER DEFAULT NULL");
        echo "Column user_id added successfully.\n";
    } else {
        echo "Column user_id already exists.\n";
    }
    
} catch(Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
