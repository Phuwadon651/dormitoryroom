<?php
$path = 'C:\workproPhu\meeting-smart-dormitory\backend-api\database\database.sqlite';
echo "Connecting to: $path\n";

try {
    $pdo = new PDO("sqlite:$path");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name='personal_access_tokens'");
    $exists = $stmt->fetch();

    if ($exists) {
        echo "Table 'personal_access_tokens' EXISTS.\n";
    } else {
        echo "Table 'personal_access_tokens' MISSING. Creating...\n";
        $sql = "CREATE TABLE \"personal_access_tokens\" (
            \"id\" integer primary key autoincrement not null, 
            \"tokenable_type\" varchar not null, 
            \"tokenable_id\" integer not null, 
            \"name\" varchar not null, 
            \"token\" varchar not null, 
            \"abilities\" text, 
            \"last_used_at\" datetime, 
            \"expires_at\" datetime, 
            \"created_at\" datetime, 
            \"updated_at\" datetime
        )";
        $pdo->exec($sql);
        
        // Add unique index
        $pdo->exec("CREATE UNIQUE INDEX \"personal_access_tokens_token_unique\" on \"personal_access_tokens\" (\"token\")");
        
        echo "Table created successfully.\n";
    }

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
