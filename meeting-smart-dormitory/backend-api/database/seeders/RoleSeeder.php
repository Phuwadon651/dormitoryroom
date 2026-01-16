<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'name' => 'เจ้าของหอ',
                'key' => 'Owner',
                'description' => 'ผู้ดูแลและเจ้าของกิจการ มีสิทธิ์เข้าถึงและจัดการข้อมูลทั้งหมดในระบบหอพัก ทั้งการเงิน การซ่อมบำรุง และข้อมูลผู้เช่า',
                'permissions' => [
                    'accessOverview' => true,
                    'accessUserManagement' => true,
                    'accessRoomManagement' => true,
                    'accessOperations' => true,
                    'accessRepair' => true,
                    'accessFinance' => true,
                ],
            ],
            [
                'name' => 'แอดมิน',
                'key' => 'Admin',
                'description' => 'ผู้ดูแลระบบทั่วไป สามารถจัดการข้อมูลส่วนใหญ่ได้ ยกเว้นข้อมูลทางการเงินเชิงลึกบางอย่าง',
                'permissions' => [
                    'accessOverview' => true,
                    'accessUserManagement' => true,
                    'accessRoomManagement' => true,
                    'accessOperations' => true,
                    'accessRepair' => true,
                    'accessFinance' => false,
                ],
            ],
            [
                'name' => 'ช่าง',
                'key' => 'Technician',
                'description' => 'จัดการการซ่อมบำรุงเท่านั้น',
                'permissions' => [
                    'accessOverview' => false,
                    'accessUserManagement' => false,
                    'accessRoomManagement' => false,
                    'accessOperations' => false,
                    'accessRepair' => true,
                    'accessFinance' => false,
                ],
            ],
            [
                'name' => 'ผู้เช่า',
                'key' => 'Tenant',
                'description' => 'ดูข้อมูลส่วนตัวเท่านั้น',
                'permissions' => [
                    'accessOverview' => true, // Limited view ideally
                    'accessUserManagement' => false,
                    'accessRoomManagement' => false,
                    'accessOperations' => false,
                    'accessRepair' => true, // Can request repair
                    'accessFinance' => true, // Can see their own payments
                ],
            ],
            [
                 'name' => 'ผู้จัดการ',
                 'key' => 'Manager',
                 'description' => 'บริหารจัดการทั่วไป',
                 'permissions' => [
                     'accessOverview' => true,
                     'accessUserManagement' => true,
                     'accessRoomManagement' => true,
                     'accessOperations' => true,
                     'accessRepair' => true,
                     'accessFinance' => true,
                 ],
            ]
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(
                ['key' => $role['key']],
                $role
            );
        }
    }
}
