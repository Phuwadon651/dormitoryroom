<?php
try {
    $pdo = new PDO('sqlite:../database/database_v2.sqlite');
    $stmt = $pdo->query("PRAGMA table_info(tenants)");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "<pre>";
    print_r($columns);
    echo "</pre>";
    
    // Attempt to add it if missing (brute force fix)
    $found = false;
    foreach ($columns as $col) {
        if ($col['name'] === 'plain_password') {
            $found = true;
            break;
        }
    }
    
    if (!$found) {
        echo "Column not found. Attempting to add...<br>";
        $pdo->exec("ALTER TABLE tenants ADD COLUMN plain_password TEXT NULL");
        echo "Column 'plain_password' added.<br>";
    } else {
        echo "Column 'plain_password' already exists.<br>";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
