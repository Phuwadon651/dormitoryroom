<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $rooms = \App\Models\Room::count();
    $tenants = \App\Models\Tenant::count();
    $users = \App\Models\User::count();
    $output = "Rooms: $rooms\nTenants: $tenants\nUsers: $users";
    file_put_contents(__DIR__ . '/cleanup_status.txt', $output);
    echo "Status written to cleanup_status.txt";
} catch (\Exception $e) {
    file_put_contents(__DIR__ . '/cleanup_status.txt', "Error: " . $e->getMessage());
}
