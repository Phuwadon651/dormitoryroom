<?php
$dbPath = __DIR__ . '/database/database_v2.sqlite';
try {
    $pdo = new PDO("sqlite:$dbPath");
    $stmt = $pdo->query("SELECT value FROM settings WHERE key='promptpay_qr_image'");
    $value = $stmt->fetchColumn();
    echo "Stored QR URL: " . ($value ? $value : "Not Found") . "\n";
    
    if ($value) {
        $parts = explode('/storage/', $value);
        if (count($parts) > 1) {
            $relativePath = $parts[1];
            $fullPath = __DIR__ . '/storage/app/public/' . $relativePath;
            echo "Checking path: $fullPath\n";
            echo "File Exists: " . (file_exists($fullPath) ? 'YES' : 'NO') . "\n";
            echo "Direct Read Check: " . (is_readable($fullPath) ? 'YES' : 'NO') . "\n";
        }
    }
} catch (PDOException $e) {
    echo "DB Error: " . $e->getMessage() . "\n";
}
