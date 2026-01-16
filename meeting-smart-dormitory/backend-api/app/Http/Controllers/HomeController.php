<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Room;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;

class HomeController extends Controller
{
    /**
     * Get aggregated dashboard statistics suitable for the Home page.
     * This endpoint consolidates data to reduce API calls.
     */
    public function index()
    {
        // 1. Room Statistics
        $totalRooms = Room::count();
        $occupiedRooms = Room::where('status', 'occupied')->count();
        $vacantRooms = Room::where('status', 'vacant')->count();
        $maintenanceRooms = Room::where('status', 'maintenance')->count();

        // 2. Tenant Statistics
        $totalTenants = Tenant::count();
        // Assuming 'is_active' or similar flag exists, otherwise just count all
        // If Tenant model doesn't have is_active, we rely on room occupancy or just total count
        // Let's assume all tenants in table are 'current' or check if they have active contract
        
        // 3. User Statistics
        $totalUsers = User::count();
        $usersByRole = User::select('role', DB::raw('count(*) as count'))
            ->groupBy('role')
            ->pluck('count', 'role');

        // 4. Financial Snapshots (Simple overview)
        $pendingInvoices = Invoice::where('status', 'pending')->count();
        $totalRevenue = Payment::where('status', 'verified')->sum('amount');
        
        // Recent Activities (Optional - can be added later)

        return response()->json([
            'success' => true,
            'data' => [
                'rooms' => [
                    'total' => $totalRooms,
                    'occupied' => $occupiedRooms,
                    'vacant' => $vacantRooms,
                    'maintenance' => $maintenanceRooms,
                    'occupancy_rate' => $totalRooms > 0 ? round(($occupiedRooms / $totalRooms) * 100, 1) : 0
                ],
                'tenants' => [
                    'total' => $totalTenants,
                ],
                'users' => [
                    'total' => $totalUsers,
                    'by_role' => $usersByRole,
                ],
                'finance' => [
                    'pending_invoices' => $pendingInvoices,
                    'total_revenue' => $totalRevenue,
                ]
            ]
        ]);
    }
}
