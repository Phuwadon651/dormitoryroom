<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Room;
use App\Models\Tenant;
use App\Models\Contract;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Ensure Roles exist first
        $this->call(RoleSeeder::class);

        // Users
        // Helper to create if not exists
        $createIfNotExists = function ($p) {
             if (!User::where('username', $p['username'])->exists()) {
                 User::create($p);
             }
        };

        // Super Admin (Owner) - Has access to EVERYTHING including Finance
        $createIfNotExists(['name' => 'ผู้ดูแลระบบสูงสุด', 'username' => 'Administrator', 'password' => Hash::make('Administrator'), 'email' => 'admin@system.com', 'role' => 'Owner', 'is_active' => true]);
        
        // Dorm Admin (Admin) - General admin, no deep finance access
        $createIfNotExists(['name' => 'ผู้ดูแลหอพัก', 'username' => 'Admin', 'password' => Hash::make('Admin'), 'email' => 'dormadmin@system.com', 'role' => 'Admin', 'is_active' => true]);
        
        // Manager - General Manager
        $createIfNotExists(['name' => 'ผู้จัดการหอพัก', 'username' => 'Manager', 'password' => Hash::make('Manager'), 'email' => 'manager@system.com', 'role' => 'Manager', 'is_active' => true]);
        
        // DISABLE ALL SAMPLE DATA GENERATION
        // \App\Models\Room::factory(10)->create();
        // \App\Models\Tenant::factory(10)->create();
    }
}
