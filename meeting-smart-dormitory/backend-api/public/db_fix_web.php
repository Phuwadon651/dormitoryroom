<?php
try {
    $dbPath = '../database/database_v2.sqlite';
    $pdo = new PDO('sqlite:' . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec("PRAGMA busy_timeout = 5000;");
    
    echo "Connected to $dbPath<br>";

    // Try to add the column
    try {
        $pdo->exec("ALTER TABLE tenants ADD COLUMN plain_password TEXT NULL");
        echo "SUCCESS: Column 'plain_password' added.<br>";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'duplicate column name') !== false) {
            echo "INFO: Column 'plain_password' already exists (Duplicate error).<br>";
        } else {
            throw $e;
        }
    }
    
    // Final Verification
    $stmt = $pdo->query("PRAGMA table_info(tenants)");
    $cols = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $found = false;
    foreach ($cols as $c) {
        if ($c['name'] === 'plain_password') $found = true;
    }
    
    if ($found) {
        echo "VERIFICATION: Column 'plain_password' IS PRESENT.<br>";
    } else {
        echo "VERIFICATION FAILED: Column is STILL MISSING.<br>";
    }

} catch (Exception $e) {
    echo "FATAL ERROR: " . $e->getMessage();
}
