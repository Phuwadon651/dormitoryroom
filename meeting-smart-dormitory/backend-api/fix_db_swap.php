<?php
// Fix DB via Table Swap
try {
    $dbPath = __DIR__ . '/database/database_v2.sqlite';
    echo "Target DB: $dbPath\n";
    
    if (!file_exists($dbPath)) {
        die("File not found!");
    }

    $pdo = new PDO("sqlite:$dbPath");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 1. Create NEW table with correct schema
    echo "Creating settings_new...\n";
    $pdo->exec("DROP TABLE IF EXISTS settings_new");
    $pdo->exec("
        CREATE TABLE settings_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key VARCHAR(255) NOT NULL,
            value TEXT,
            `group` VARCHAR(255) DEFAULT 'general',
            type VARCHAR(50) DEFAULT 'string',
            created_at DATETIME,
            updated_at DATETIME
        )
    ");

    // 2. Copy Data
    echo "Copying data...\n";
    // We explicitly list columns to select from old table, handling potential missing ones by not selecting them if they don't exist? 
    // Actually, SQL can't conditionally select. We select * and process in PHP.
    $stmt = $pdo->query("SELECT * FROM settings");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $insert = $pdo->prepare("
        INSERT INTO settings_new (id, key, value, `group`, type, created_at, updated_at) 
        VALUES (:id, :key, :value, :group, :type, :created_at, :updated_at)
    ");

    foreach ($rows as $row) {
        $insert->execute([
            ':id' => $row['id'],
            ':key' => $row['key'],
            ':value' => $row['value'],
            ':group' => $row['group'] ?? 'general', // Default if missing in source
            ':type' => $row['type'] ?? 'string',     // Default if missing in source
            ':created_at' => $row['created_at'] ?? date('Y-m-d H:i:s'),
            ':updated_at' => $row['updated_at'] ?? date('Y-m-d H:i:s')
        ]);
    }
    echo "Copied " . count($rows) . " rows.\n";

    // 3. Swap Tables
    // SQLite doesn't support RENAME TABLE target exists, so we drop target first.
    echo "Dropping old settings table...\n";
    $pdo->exec("DROP TABLE settings");
    
    echo "Renaming settings_new to settings...\n";
    $pdo->exec("ALTER TABLE settings_new RENAME TO settings");

    echo "SUCCESS: Table swapped and schema fixed.\n";
    
    // Verify
    $cols = $pdo->query("PRAGMA table_info(settings)")->fetchAll(PDO::FETCH_COLUMN, 1);
    file_put_contents('swap_result.txt', "Columns: " . implode(',', $cols));

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
    file_put_contents('swap_error.txt', $e->getMessage());
}
