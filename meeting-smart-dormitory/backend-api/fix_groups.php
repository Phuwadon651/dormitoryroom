<?php

use App\Models\Setting;

require 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$updates = [
    'water_unit_price' => 'finance',
    'electric_unit_price' => 'finance',
    'common_fee' => 'general', // Ensure this is general or finance as needed
    'line_notify_token' => 'notification',
    'enable_email_notify' => 'notification'
];

foreach ($updates as $key => $group) {
    $setting = Setting::where('key', $key)->first();
    if ($setting) {
        $setting->group = $group;
        $setting->save();
        echo "Updated $key to group $group\n";
    } else {
        echo "Setting $key not found\n";
    }
}

echo "Done.\n";
