<?php

use App\Models\Setting;
use Illuminate\Support\Facades\DB;

require 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$keysToCheck = ['water_unit_price', 'electric_unit_price', 'common_fee'];

foreach ($keysToCheck as $key) {
    $settings = Setting::where('key', $key)->orderBy('updated_at', 'desc')->get();
    
    if ($settings->count() > 1) {
        echo "Found {$settings->count()} entries for '$key'. Cleaning up...\n";
        
        // Keep the first one (most recently updated), delete others
        $toKeep = $settings->shift(); 
        
        foreach ($settings as $duplicate) {
            echo "Deleting duplicate ID: {$duplicate->id} (Value: {$duplicate->value})\n";
            $duplicate->delete();
        }
        
        echo "Kept ID: {$toKeep->id} (Value: {$toKeep->value})\n";
    } else {
        echo "Key '$key' is clean (Found: {$settings->count()}).\n";
    }
}

echo "Deduplication complete.\n";
