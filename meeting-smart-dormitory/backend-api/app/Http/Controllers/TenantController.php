<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use Illuminate\Http\Request;

class TenantController extends Controller
{
    public function index()
    {
        // Include room data if needed
        return Tenant::with('room')->get();
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required',
                'phone' => 'required',
                'room_id' => 'required|exists:rooms,id',
                'status' => 'required',
                'email' => 'nullable|email',
                'move_in_date' => 'nullable|date',
            ]);

            $tenant = Tenant::create($validated);
            
            // Update room status
            if ($tenant->room_id) {
                $tenant->room->update(['status' => 'ไม่ว่าง']);
            }

            return response()->json($tenant, 201);
        } catch (\Exception $e) {
            \Log::error('Tenant Store Error: ' . $e->getMessage());
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $tenant = Tenant::findOrFail($id);
        $oldRoomId = $tenant->room_id;
        
        $tenant->update($request->all());

        // Handle room change logic if needed
        if ($request->has('room_id') && $oldRoomId != $request->room_id) {
            // Free old room
            \App\Models\Room::find($oldRoomId)->update(['status' => 'ว่าง']);
            // Occupy new room
            \App\Models\Room::find($request->room_id)->update(['status' => 'ไม่ว่าง']);
        }

        return response()->json($tenant);
    }

    public function destroy($id)
    {
        $tenant = Tenant::findOrFail($id);
        if ($tenant->room_id) {
            $tenant->room->update(['status' => 'ว่าง']);
        }
        $tenant->delete();
        return response()->json(['success' => true]);
    }
}
