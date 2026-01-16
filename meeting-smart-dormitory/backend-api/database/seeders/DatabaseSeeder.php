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
        User::create(['name' => 'ผู้ดูแลระบบสูงสุด', 'username' => 'Administrator', 'password' => Hash::make('Administrator'), 'email' => 'admin@system.com', 'role' => 'Admin', 'is_active' => true]);
        User::create(['name' => 'ผู้ดูแลหอพัก', 'username' => 'Admin', 'password' => Hash::make('Admin'), 'email' => 'dormadmin@system.com', 'role' => 'DormAdmin', 'is_active' => true]);
        User::create(['name' => 'ผู้จัดการหอพัก', 'username' => 'Manager', 'password' => Hash::make('Manager'), 'email' => 'manager@system.com', 'role' => 'Manager', 'is_active' => true]);
        User::create(['name' => 'สมชาย ใจดี', 'username' => 'Tenant1', 'password' => Hash::make('Tenant1'), 'email' => 'tenant1@system.com', 'role' => 'Tenant', 'is_active' => true]);
        User::create(['name' => 'ช่างสมศักดิ์', 'username' => 'Technician1', 'password' => Hash::make('Technician1'), 'email' => 'technician1@system.com', 'role' => 'Technician', 'is_active' => true]);

        // Rooms
        $rooms = [];
        for ($f = 1; $f <= 4; $f++) {
            for ($r = 1; $r <= 5; $r++) {
                $roomNum = "{$f}0{$r}";
                $room = Room::create([
                    'room_number' => $roomNum,
                    'floor' => $f,
                    'room_type' => $r % 2 == 0 ? 'แอร์' : 'พัดลม',
                    'price' => $r % 2 == 0 ? 4500 : 3500,
                    'status' => 'ว่าง',
                ]);
                $rooms[$roomNum] = $room;
            }
        }

        // Tenants
        // 1. Somchai -> 404
        if (isset($rooms['404'])) {
            $tenant1 = Tenant::create([
                'name' => 'นายสมชาย ใจดี',
                'phone' => '081-234-5678',
                'room_id' => $rooms['404']->id,
                'status' => 'Active',
                'email' => 'somchai@example.com',
                'move_in_date' => '2025-01-01',
            ]);
            $rooms['404']->update(['status' => 'ไม่ว่าง']);

            Contract::create([
                'tenant_id' => $tenant1->id,
                'room_id' => $rooms['404']->id,
                'start_date' => '2025-01-01',
                'rent_price' => 4500,
                'deposit' => 9000,
                'is_active' => true,
            ]);
        }

        // 2. Somying -> 202
        if (isset($rooms['202'])) {
            $tenant2 = Tenant::create([
                'name' => 'นางสาวสมหญิง รักเรียน',
                'phone' => '089-987-6543',
                'room_id' => $rooms['202']->id,
                'status' => 'Active',
                'email' => 'somying@example.com',
                'move_in_date' => '2025-02-15',
            ]);
            $rooms['202']->update(['status' => 'ไม่ว่าง']);

            Contract::create([
                'tenant_id' => $tenant2->id,
                'room_id' => $rooms['202']->id,
                'start_date' => '2025-02-15',
                'rent_price' => 4500,
                'deposit' => 9000,
                'is_active' => true,
            ]);
        }
    }
}
