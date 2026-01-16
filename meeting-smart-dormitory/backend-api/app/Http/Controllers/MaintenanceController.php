<?php

namespace App\Http\Controllers;

use App\Models\Maintenance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MaintenanceController extends Controller
{
    public function index(Request $request)
    {
        $query = Maintenance::with(['user', 'room', 'technician']);

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // If user is not admin/manager/technician, show only their requests
        // Assuming a simple role check, or if 'role' column exists directly on user
        // Adjust logic based on actual role implementation
        $user = Auth::user();
        if ($user->role === 'tenant') { 
             $query->where('user_id', $user->id);
        } elseif ($user->role === 'technician') {
             $query->where('technician_id', $user->id);
        }

        $maintenances = $query->latest()->get();

        return response()->json($maintenances);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'room_id' => 'required|exists:rooms,room_id',
            'damage_details' => 'required|string',
            'repair_type' => 'required|string',
            'report_date' => 'required|date',
        ]);

        $maintenance = Maintenance::create([
            'user_id' => Auth::id(),
            'room_id' => $validated['room_id'],
            'damage_details' => $validated['damage_details'],
            'repair_type' => $validated['repair_type'],
            'report_date' => $validated['report_date'],
            'status' => 'pending',
        ]);

        return response()->json($maintenance, 201);
    }

    public function show($id)
    {
        $maintenance = Maintenance::with(['user', 'room', 'technician'])->findOrFail($id);
        
        // Authorization check could go here

        return response()->json($maintenance);
    }

    public function update(Request $request, $id)
    {
        $maintenance = Maintenance::findOrFail($id);

        $validated = $request->validate([
            'status' => 'sometimes|in:pending,in_progress,completed',
            'technician_id' => 'sometimes|exists:users,id',
            'fix_date' => 'sometimes|date',
        ]);

        $maintenance->update($validated);

        return response()->json($maintenance);
    }

    public function destroy($id)
    {
        $maintenance = Maintenance::findOrFail($id);
        $maintenance->delete();

        return response()->json(null, 204);
    }
}
