<?php
$dbPath = __DIR__ . '/database/database_v2.sqlite';
$log = "Target: $dbPath\n";

try {
    if (!file_exists($dbPath)) {
        die("DB File not found!");
    }
    
    $pdo = new PDO("sqlite:$dbPath");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 1. Check Initial State
    $stmt = $pdo->query("PRAGMA table_info(settings)");
    $cols = $stmt->fetchAll(PDO::FETCH_COLUMN, 1);
    $log .= "Initial Columns: " . implode(', ', $cols) . "\n";

    if (!in_array('type', $cols)) {
        $log .= "Column 'type' MISSING. Initiating Fix...\n";
        
        // Backup
        $data = $pdo->query("SELECT * FROM settings")->fetchAll(PDO::FETCH_ASSOC);
        $log .= "Backed up " . count($data) . " rows.\n";

        // DROP
        $pdo->exec("DROP TABLE settings");
        $log .= "Table dropped.\n";

        // CREATE
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
        $log .= "Table recreated.\n";

        // RESTORE
        $insert = $pdo->prepare("INSERT INTO settings (key, value, `group`, type, created_at, updated_at) VALUES (:k, :v, :g, :t, :c, :u)");
        foreach ($data as $row) {
            $insert->execute([
                ':k' => $row['key'],
                ':v' => $row['value'],
                ':g' => $row['group'] ?? 'general',
                ':t' => $row['type'] ?? 'string',
                ':c' => $row['created_at'] ?? date('Y-m-d H:i:s'),
                ':u' => $row['updated_at'] ?? date('Y-m-d H:i:s')
            ]);
        }
        $log .= "Data restored.\n";
    } else {
        $log .= "Column 'type' EXISTS. No action needed.\n";
    }

    // 2. Final Verification
    $stmt = $pdo->query("PRAGMA table_info(settings)");
    $finalCols = $stmt->fetchAll(PDO::FETCH_COLUMN, 1);
    $log .= "Final Columns: " . implode(', ', $finalCols) . "\n";

    if (in_array('type', $finalCols)) {
        $log .= "VERIFICATION PASSED.\n";
    } else {
        $log .= "VERIFICATION FAILED.\n";
    }

} catch (Exception $e) {
    $log .= "ERROR: " . $e->getMessage() . "\n";
}

file_put_contents('fix_log.txt', $log);
echo "Log written to fix_log.txt";
