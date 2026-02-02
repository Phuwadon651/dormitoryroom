<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$maintenance = App\Models\Maintenance::with('room')->latest()->first();
echo json_encode($maintenance, JSON_PRETTY_PRINT);
