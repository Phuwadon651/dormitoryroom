<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            ['key' => 'dorm_name', 'value' => 'หอพักตัวอย่าง', 'group' => 'general', 'type' => 'string'],
            ['key' => 'dorm_address', 'value' => '', 'group' => 'general', 'type' => 'string'],
            ['key' => 'dorm_phone', 'value' => '', 'group' => 'general', 'type' => 'string'],
            ['key' => 'water_unit_price', 'value' => '18', 'group' => 'finance', 'type' => 'number'],
            ['key' => 'electric_unit_price', 'value' => '8', 'group' => 'finance', 'type' => 'number'],
            ['key' => 'line_notify_token', 'value' => '', 'group' => 'notification', 'type' => 'string'],
            ['key' => 'enable_email_notify', 'value' => '0', 'group' => 'notification', 'type' => 'boolean'],
        ];

        foreach ($defaults as $setting) {
            DB::table('settings')->updateOrInsert(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
