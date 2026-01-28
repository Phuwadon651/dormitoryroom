<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Default Connection: " . config('database.default') . "\n";
echo "SQLite Database Path: " . config('database.connections.sqlite.database') . "\n";
