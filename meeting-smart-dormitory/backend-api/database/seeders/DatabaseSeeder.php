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
        // Users
        // Helper to create if not exists
        $createIfNotExists = function ($p) {
             if (!User::where('username', $p['username'])->exists()) {
                 User::create($p);
             }
        };

        $createIfNotExists(['name' => 'ผู้ดูแลระบบสูงสุด', 'username' => 'Administrator', 'password' => Hash::make('Administrator'), 'email' => 'admin@system.com', 'role' => 'Admin', 'is_active' => true]);
        $createIfNotExists(['name' => 'ผู้ดูแลหอพัก', 'username' => 'Admin', 'password' => Hash::make('Admin'), 'email' => 'dormadmin@system.com', 'role' => 'DormAdmin', 'is_active' => true]);
        $createIfNotExists(['name' => 'ผู้จัดการหอพัก', 'username' => 'Manager', 'password' => Hash::make('Manager'), 'email' => 'manager@system.com', 'role' => 'Manager', 'is_active' => true]);
        
        // DISABLE ALL SAMPLE DATA GENERATION
        // \App\Models\Room::factory(10)->create();
        // \App\Models\Tenant::factory(10)->create();
    }
}
