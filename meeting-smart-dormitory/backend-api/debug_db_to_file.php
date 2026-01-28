<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$output = "Default Connection: " . config('database.default') . "\n";
$output .= "SQLite Database Path: " . config('database.connections.sqlite.database') . "\n";
$output .= "ENV DB_DATABASE: " . env('DB_DATABASE') . "\n";

file_put_contents('db_config.txt', $output);
