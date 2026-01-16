<?php
$dbPath = __DIR__ . '/database/database_v2.sqlite';
echo "Checking Database: " . $dbPath . "\n";

if (!file_exists($dbPath)) {
    echo "ERROR: Database file not found!\n";
    exit(1);
}

try {
    $pdo = new PDO("sqlite:$dbPath");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $pdo->query("PRAGMA table_info(users)");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "Columns in 'users' table:\n";
    foreach ($columns as $col) {
        echo "- " . $col['name'] . " (" . $col['type'] . ")\n";
    }

} catch (PDOException $e) {
    echo "PDO Error: " . $e->getMessage() . "\n";
}
