<?php

$dbPath = __DIR__ . '/database/database_v2.sqlite';
echo "Target DB: $dbPath\n";

if (!file_exists($dbPath)) {
    echo "ERROR: DB file not found!\n";
    exit(1);
}

try {
    $pdo = new PDO("sqlite:$dbPath");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Try to add the column directly. If it exists, it will throw an exception.
    try {
        echo "Attempting to add 'permissions' column...\n";
        $pdo->exec("ALTER TABLE users ADD COLUMN permissions TEXT DEFAULT NULL");
        echo "SUCCESS: Column 'permissions' added.\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'duplicate column name') !== false) {
            echo "NOTICE: Column 'permissions' already exists (Duplicate error).\n";
        } else {
            echo "ERROR adding column: " . $e->getMessage() . "\n";
        }
    }

    // verification
    $stmt = $pdo->query("PRAGMA table_info(users)");
    $cols = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $found = false;
    foreach($cols as $c) {
        if ($c['name'] === 'permissions') $found = true;
    }
    
    if ($found) {
        echo "VERIFIED: Column 'permissions' exists in schema.\n";
    } else {
        echo "FAILED: Column 'permissions' NOT found in schema after attempt.\n";
    }

} catch (PDOException $e) {
    echo "FATAL PDO Error: " . $e->getMessage() . "\n";
    exit(1);
}
