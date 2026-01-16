<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

echo "Fixing Administrator...\n";

$user = User::where('username', 'Administrator')->first();
if ($user) {
    $user->role = 'Admin';
    $user->name = 'ผู้ดูแลระบบสูงสุด';
    $user->password = Hash::make('Administrator');
    $user->save();
    echo "UPDATED: {$user->username} | Role: {$user->role} | Name: {$user->name}\n";
} else {
    $user = User::create([
        'username' => 'Administrator',
        'password' => Hash::make('Administrator'),
        'role' => 'Admin',
        'name' => 'ผู้ดูแลระบบสูงสุด',
        'email' => 'admin@system.com',
        'is_active' => true
    ]);
    echo "CREATED: {$user->username} | Role: {$user->role} | Name: {$user->name}\n";
}
