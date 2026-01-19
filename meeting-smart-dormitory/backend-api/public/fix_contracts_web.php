<?php
use App\Models\Tenant;
use App\Models\Contract;
use App\Models\Room;
use Illuminate\Support\Facades\DB;

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

echo "<h1>Fixing Missing Contracts...</h1>";

$tenants = Tenant::whereNotNull('room_id')->get();
$count = 0;

foreach ($tenants as $tenant) {
    // Check if has active contract
    $hasContract = Contract::where('tenant_id', $tenant->id)
                           ->where('is_active', true)
                           ->exists();
    
    if (!$hasContract) {
        echo "Fixing Tenant: {$tenant->name} (Room: {$tenant->room_id})<br>";
        
        $room = Room::find($tenant->room_id);
        
        Contract::create([
            'tenant_id' => $tenant->id,
            'room_id' => $tenant->room_id,
            'start_date' => $tenant->move_in_date ?? now(),
            'rent_price' => $room ? $room->price : 0,
            'deposit' => 0,
            'is_active' => true,
        ]);
        
        $count++;
    }
}

echo "<h3>Fixed $count tenants.</h3>";
