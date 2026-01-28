<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$defaults = [
    'water_unit_price' => '18',
    'electric_unit_price' => '8',
    'common_fee' => '300',
];

$keys = DB::table('settings')->select('key')->distinct()->pluck('key');

echo "Starting cleanup...\n";

foreach ($keys as $key) {
    $rows = DB::table('settings')->where('key', $key)->orderBy('updated_at', 'desc')->get();

    if ($rows->count() <= 1) {
        continue;
    }

    echo "Duplicate found for key: $key (Count: {$rows->count()})\n";

    $keeper = null;
    $others = [];

    // Special logic for keys with known defaults
    if (isset($defaults[$key])) {
        $defaultValue = $defaults[$key];
        // Look for any row that DOES NOT match the default (User input)
        $userInputs = $rows->filter(function ($row) use ($defaultValue) {
            return $row->value != $defaultValue;
        });

        if ($userInputs->isNotEmpty()) {
            // Keep the latest user input
            $keeper = $userInputs->first();
            // All others (including defaults and older user inputs) are trash
            $others = $rows->where('id', '!=', $keeper->id);
        } else {
            // All are defaults, just keep the latest (or any)
            $keeper = $rows->first();
            $others = $rows->skip(1);
        }
    } else {
        // Standard logic: Keep latest
        $keeper = $rows->first();
        $others = $rows->skip(1);
    }

    // Delete others
    $idsToDelete = $others->pluck('id')->toArray();
    if (!empty($idsToDelete)) {
        DB::table('settings')->whereIn('id', $idsToDelete)->delete();
        echo "  Deleted IDs: " . implode(', ', $idsToDelete) . "\n";
    }

    echo "  Kept ID: {$keeper->id} (Value: {$keeper->value})\n";
}

echo "Cleanup complete.\n";
