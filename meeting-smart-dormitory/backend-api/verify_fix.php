<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$keys = ['water_unit_price', 'electric_unit_price', 'common_fee'];
$output = "";

foreach ($keys as $key) {
    $rows = DB::table('settings')->where('key', $key)->get();
    $output .= "$key (Count: " . $rows->count() . ")\n";
    foreach ($rows as $row) {
        $output .= " - ID: {$row->id} | Val: {$row->value} | Grp: {$row->group}\n";
    }
    $output .= "---\n";
}

file_put_contents('verification_result.txt', $output);
echo "Done.";
