<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RoleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Return all roles with user count
        $roles = Role::withCount('users')->get();
        return response()->json($roles);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'permissions' => 'required|array',
            'description' => 'nullable|string',
        ]);

        // Generate a key from name if not provided (simple slug)
        $key = 'Custom-' . time();
        
        $role = Role::create([
            'name' => $validated['name'],
            'key' => $key,
            'description' => $validated['description'],
            'permissions' => $validated['permissions'],
            'is_active' => true,
        ]);

        return response()->json($role, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Role $role)
    {
        $role->load('users');
        return response()->json($role);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'permissions' => 'sometimes|array',
            'description' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
        ]);

        $role->update($validated);

        return response()->json($role);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Role $role)
    {
        // Prevent deleting core roles if needed, or check logic
        if (in_array($role->key, ['Owner', 'Admin', 'Tenant', 'Technician', 'Manager'])) {
             // Maybe allow editing but warn on delete? User requirement says "Owner" has highest rights.
             // For now, let's allow delete but maybe we should block Owner deletion.
             if ($role->key === 'Owner') {
                 return response()->json(['message' => 'Cannot delete Owner role'], 403);
             }
        }
        
        $role->delete();
        return response()->json(['message' => 'Role deleted']);
    }

    public function assignUser(Request $request, Role $role)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $user = User::findOrFail($validated['user_id']);
        $user->role_id = $role->id;
        // Also update the legacy role string to match the role name or key?
        // Let's keep them in sync for now as much as possible, or just rely on role_id
        $user->role = $role->key; 
        $user->save();

        return response()->json(['message' => 'User assigned to role']);
    }
    
    public function removeUser(Request $request, Role $role)
    {
         $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);
        
        $user = User::findOrFail($validated['user_id']);
        if ($user->role_id === $role->id) {
            $user->role_id = null;
            $user->role = 'Tenant'; // Default fallback?
            $user->save();
        }
        
        return response()->json(['message' => 'User removed from role']);
    }
}
