<?php
try {
    $dbPath = __DIR__ . '/database/database_v2.sqlite';
    if (!file_exists($dbPath)) {
        die("Database file not found at: $dbPath");
    }

    $pdo = new PDO("sqlite:$dbPath");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 1. Check if table exists
    $stmt = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name='settings'");
    if (!$stmt->fetch()) {
        die("Table 'settings' does not exist!");
    }

    // 2. Check columns
    $stmt = $pdo->query("PRAGMA table_info(settings)");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN, 1);
    
    $output = "Current columns: " . implode(', ', $columns) . "\n";

    // 3. Force Add 'type'
    if (!in_array('type', $columns)) {
        $output .= "Adding 'type' column...\n";
        $pdo->exec("ALTER TABLE settings ADD COLUMN type TEXT DEFAULT 'string'");
        $output .= "Column 'type' added successfully.\n";
    } else {
        $output .= "Column 'type' already exists.\n";
    }

    // 4. Force Add 'group'
    if (!in_array('group', $columns)) {
        $output .= "Adding 'group' column...\n";
        $pdo->exec("ALTER TABLE settings ADD COLUMN 'group' TEXT DEFAULT 'general'");
        $output .= "Column 'group' added successfully.\n";
    } else {
        $output .= "Column 'group' already exists.\n";
    }

    // 5. Verify
    $stmt = $pdo->query("PRAGMA table_info(settings)");
    $newColumns = $stmt->fetchAll(PDO::FETCH_COLUMN, 1);
    $output .= "Final columns: " . implode(', ', $newColumns) . "\n";

    file_put_contents('raw_fix_result.txt', $output);
    echo "Done. Check raw_fix_result.txt";

} catch (Exception $e) {
    file_put_contents('raw_fix_error.txt', $e->getMessage());
    echo "Error: " . $e->getMessage();
}
