<?php
try {
    // 1. Setup Connection
    $dbPath = __DIR__ . '/database/database_v2.sqlite';
    if (!file_exists($dbPath)) {
        // Fallback or error
        $dbPath = __DIR__ . '/database/database.sqlite'; 
        if (!file_exists($dbPath)) die("No DB found.");
    }
    
    echo "Using DB: $dbPath\n";
    $pdo = new PDO("sqlite:$dbPath");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 2. Backup Data
    echo "Backing up data...\n";
    $stmt = $pdo->query("SELECT * FROM settings");
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "Backup count: " . count($data) . "\n";

    // 3. Drop Table
    echo "Dropping table...\n";
    $pdo->exec("DROP TABLE IF EXISTS settings");

    // 4. Recreate Table (Correct Schema)
    echo "Recreating table...\n";
    $pdo->exec("
        CREATE TABLE settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key VARCHAR(255) NOT NULL,
            value TEXT,
            `group` VARCHAR(255) DEFAULT 'general',
            type VARCHAR(50) DEFAULT 'string',
            created_at DATETIME,
            updated_at DATETIME
        )
    ");

    // 5. Restore Data
    echo "Restoring data...\n";
    $stmt = $pdo->prepare("INSERT INTO settings (key, value, `group`, type, created_at, updated_at) VALUES (:key, :value, :group, :type, :created_at, :updated_at)");
    
    foreach ($data as $row) {
        $stmt->execute([
            ':key' => $row['key'],
            ':value' => $row['value'],
            ':group' => $row['group'] ?? 'general', // Handle missing cols in backup
            ':type' => $row['type'] ?? 'string',     // Handle missing cols in backup
            ':created_at' => $row['created_at'] ?? date('Y-m-d H:i:s'),
            ':updated_at' => date('Y-m-d H:i:s')
        ]);
    }

    echo "Success! Table recreated with correct columns.";
    file_put_contents('nuclear_result.txt', "Success");

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
    file_put_contents('nuclear_error.txt', $e->getMessage());
}
