<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

function createOrUpdateUser($username, $password, $role, $name, $email) {
    $user = User::where('username', $username)->first();
    if ($user) {
        echo "Updating User: $username ($role)\n";
        $user->password = Hash::make($password);
        $user->role = $role; // Ensure role is correct
        $user->name = $name; // Ensure name is correct
        $user->save();
        echo " - Password, Role, and Name updated.\n";
    } else {
        echo "Creating User: $username ($role)\n";
        User::create([
            'name' => $name,
            'username' => $username,
            'password' => Hash::make($password),
            'email' => $email,
            'role' => $role,
            'is_active' => true
        ]);
        echo " - User created.\n";
    }
}

echo "=== Setting up Users ===\n";

// 1. Super Admin (Administrator)
createOrUpdateUser(
    'Administrator', 
    'Administrator', 
    'Admin', // Role = Admin (Super Admin)
    'ผู้ดูแลระบบสูงสุด', 
    'admin@system.com'
);

// 2. Dorm Admin (Admin) - Requested username "Admin"
createOrUpdateUser(
    'Admin', 
    'Admin', 
    'DormAdmin', // Role = DormAdmin
    'ผู้ดูแลหอพัก', 
    'dormadmin@system.com'
);

// 3. Manager (Manager)
createOrUpdateUser(
    'Manager', 
    'Manager', 
    'Manager', // Role = Manager
    'ผู้จัดการหอพัก', 
    'manager@system.com'
);

// 4. Tenant (Tenant1) - Keep for testing
createOrUpdateUser(
    'Tenant1', 
    'Tenant1', 
    'Tenant', 
    'สมชาย ใจดี', 
    'tenant1@gmail.com'
);

// 5. Technician (Technician1)
createOrUpdateUser(
    'Technician1', 
    'Technician1', 
    'Technician', 
    'ช่างซ่อมมือหนึ่ง', 
    'tech1@system.com'
);

echo "\nAll Users:\n";
foreach (User::all() as $u) {
    echo "- [{$u->id}] Username: {$u->username} | Role: {$u->role}\n";
}
