<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$settings = Illuminate\Support\Facades\DB::table('settings')->get();
$output = "Total Rows: " . $settings->count() . "\n";
foreach ($settings as $s) {
    $output .= "ID: {$s->id} | Key: {$s->key} | Value: {$s->value} | Group: {$s->group} | Type: {$s->type}\n";
}
file_put_contents('settings_inspection.txt', $output);
echo "Done writing to settings_inspection.txt";
