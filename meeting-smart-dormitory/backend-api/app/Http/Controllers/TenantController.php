<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use Illuminate\Http\Request;

class TenantController extends Controller
{
    public function index()
    {
        // Include room and user data
        return Tenant::with(['room', 'user'])->get();
    }

    public function store(Request $request)
    {
        try {
            // Validate request
            $validated = $request->validate([
                'name' => 'required',
                'phone' => 'required',
                'room_id' => 'required|exists:rooms,id',
                'status' => 'required',
                'email' => 'nullable|email|unique:users,email',
                'move_in_date' => 'nullable|date',
                'username' => 'required|unique:users,username',
                'password' => 'required|min:6',
            ]);

            \Illuminate\Support\Facades\DB::beginTransaction();

            // 1. Create User Account
            $user = \App\Models\User::create([
                'name' => $request->name,
                'username' => $request->username,
                'email' => $request->email ?? ($request->username . '@noemail.com'),
                'password' => \Illuminate\Support\Facades\Hash::make($request->password),
                'role' => 'Tenant',
                'is_active' => true,
                // Assign role_id if you have a Role model, e.g. Role::where('key', 'Tenant')->first()->id
                // For now assuming string role is sufficient or handled by observers
            ]);

            // 2. Create Tenant Record
            // Remove user-specific fields from tenant data
            $tenantData = $request->except(['username', 'password', 'password_confirmation']);
            $tenantData['user_id'] = $user->id;
            $tenantData['plain_password'] = $request->password; // Store plain password
            $tenant = Tenant::create($tenantData);
            
            // Create Contract if room is assigned
            if ($tenant->room_id) {
                $room = \App\Models\Room::find($tenant->room_id);
                \App\Models\Contract::create([
                    'tenant_id' => $tenant->id,
                    'room_id' => $tenant->room_id,
                    'start_date' => $tenant->move_in_date ?? now(),
                    'rent_price' => $room ? $room->price : 0,
                    'is_active' => true,
                ]);

                $tenant->room->update(['status' => 'ไม่ว่าง']);
            }

            \Illuminate\Support\Facades\DB::commit();

            $tenant->load(['user', 'room']);
            return response()->json($tenant, 201);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            \Log::error('Tenant Store Error: ' . $e->getMessage());
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $tenant = Tenant::findOrFail($id);
        $oldRoomId = $tenant->room_id;
        
        $tenantData = $request->all();
        if ($request->filled('password')) {
            $tenantData['plain_password'] = $request->password;
            // Also update User password
            if ($tenant->user) {
                $tenant->user->update([
                    'password' => \Illuminate\Support\Facades\Hash::make($request->password)
                ]);
            }
        }

        $tenant->update($tenantData);

        // Handle room change logic if needed
        if ($request->has('room_id') && $oldRoomId != $request->room_id) {
            // Free old room
            \App\Models\Room::find($oldRoomId)->update(['status' => 'ว่าง']);
            // Occupy new room
            \App\Models\Room::find($request->room_id)->update(['status' => 'ไม่ว่าง']);
        }

        $tenant->load(['user', 'room']);
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

    public function me(Request $request)
    {
        $user = $request->user();
        
        // Find tenant record associated with this user
        $tenant = Tenant::where('user_id', $user->id)
            ->with(['room', 'contracts.invoices'])
            ->first();

        if (!$tenant) {
            return response()->json(['message' => 'Tenant profile not found for this user.'], 404);
        }

        // Fetch maintenance requests made by this user
        // Using 'maintenances' relationship on User model if available, 
        // or query directly if Relationship is defined in User.
        $maintenances = \App\Models\Maintenance::where('user_id', $user->id)->get();

        // Structure data to match frontend expectations
        // We can either return raw and map in frontend, or map here.
        // Let's return raw aggregated data.
        
        return response()->json([
            'profile' => $tenant,
            'maintenances' => $maintenances,
            // You can add more related data here
        ]);
    }
}
