<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $controller = new \App\Http\Controllers\MeterReadingController();
    echo "Controller instantiated successfully.\n";
    
    $request = Illuminate\Http\Request::create('/api/meter-readings', 'GET');
    $response = $controller->index($request); // Might fail due to auth middleware or missing request data but checking for syntax/runtime internal errors
    echo "Index method callable.\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
