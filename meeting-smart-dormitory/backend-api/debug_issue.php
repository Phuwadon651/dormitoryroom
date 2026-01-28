<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "APP_URL (Config): " . config('app.url') . "\n";
echo "Asset URL (Test): " . asset('storage/test.png') . "\n";

$setting = \App\Models\Setting::where('key', 'promptpay_qr_image')->first();
if ($setting) {
    echo "Stored QR URL: " . $setting->value . "\n";
} else {
    echo "Stored QR URL: Not Found\n";
}

// Check if file exists for the stored URL
if ($setting) {
    // Extract path from URL
    // URL: http://127.0.0.1:8000/storage/uploads/xxx.png
    // Path should be uploads/xxx.png matching storage/app/public/uploads/xxx.png
    
    $parts = explode('/storage/', $setting->value);
    if (count($parts) > 1) {
        $relativePath = $parts[1];
        $fullPath = storage_path('app/public/' . $relativePath);
        echo "Checking path: $fullPath\n";
        echo "File Exists: " . (file_exists($fullPath) ? 'YES' : 'NO') . "\n";
    }
}
