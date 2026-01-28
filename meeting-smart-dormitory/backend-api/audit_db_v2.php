<?php
$dbPath = __DIR__ . '/database/database_v2.sqlite';
$output = "Checking: $dbPath\n";

if (!file_exists($dbPath)) {
    die("DB File NOT FOUND");
}

try {
    $pdo = new PDO("sqlite:$dbPath");
    $stmt = $pdo->query("SELECT sql FROM sqlite_master WHERE type='table' AND name='settings'");
    $sql = $stmt->fetchColumn();
    
    $output .= "CREATE STATEMENT:\n$sql\n";
    
    // Check columns via PRAGMA
    $stmt = $pdo->query("PRAGMA table_info(settings)");
    $cols = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $output .= "\nPRAGMA table_info:\n";
    foreach ($cols as $col) {
        $output .= " - {$col['name']} ({$col['type']})\n";
    }

} catch (Exception $e) {
    $output .= "Error: " . $e->getMessage();
}

file_put_contents('audit_result.txt', $output);
echo "Audit complete.";
