<?php
try {
    $dbPath = __DIR__ . '/database/database_v2.sqlite';
    if (!file_exists($dbPath)) {
        file_put_contents(__DIR__ . '/raw_status.txt', "DB Not Found at $dbPath");
        exit;
    }
    $db = new PDO('sqlite:' . $dbPath);
    $rooms = $db->query("SELECT count(*) FROM rooms")->fetchColumn();
    $tenants = $db->query("SELECT count(*) FROM tenants")->fetchColumn();
    $users = $db->query("SELECT count(*) FROM users")->fetchColumn();
    
    $output = "Rooms: $rooms\nTenants: $tenants\nUsers: $users";
    file_put_contents(__DIR__ . '/raw_status.txt', $output);
    echo $output;
} catch (\Exception $e) {
    file_put_contents(__DIR__ . '/raw_status.txt', "Error: " . $e->getMessage());
}
