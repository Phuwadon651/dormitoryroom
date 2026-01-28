<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Http\Controllers\MeterReadingController;
use Illuminate\Http\Request;

try {
    echo "=== Testing Summary ===\n";
    $controller = new MeterReadingController();
    $request = Request::create('/api/meter-readings/summary', 'GET', ['month' => 1, 'year' => 2024]);
    
    $response = $controller->summary($request);
    echo "Summary Status: " . $response->getStatusCode() . "\n";
    if ($response->getStatusCode() !== 200) {
        echo "Summary Error: " . $response->getContent() . "\n";
    }

    echo "\n=== Testing Index ===\n";
    $requestIndex = Request::create('/api/meter-readings', 'GET', ['month' => 1, 'year' => 2024]);
    $responseIndex = $controller->index($requestIndex);
    echo "Index Status: " . $responseIndex->getStatusCode() . "\n";
    if ($responseIndex->getStatusCode() !== 200) {
        echo "Index Error: " . $responseIndex->getContent() . "\n";
    } else {
        echo "Index Success (Count: " . count(json_decode($responseIndex->getContent(), true)) . ")\n";
    }

} catch (\Throwable $e) {
    echo "EXCEPTION: " . $e->getMessage() . "\nIn " . $e->getFile() . " on line " . $e->getLine() . "\n";
    echo $e->getTraceAsString();
}
