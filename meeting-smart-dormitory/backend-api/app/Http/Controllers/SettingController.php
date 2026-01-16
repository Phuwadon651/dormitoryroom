<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SettingController extends Controller
{
    /**
     * Check authorization for settings access.
     */
    private function checkAuth()
    {
        $user = Auth::user();
        // Allow if role is admin or manager using string check or relationship
        // Assuming role keys: 'admin', 'manager', 'system_admin'
        // Adjust these keys based on your actual role seeding
        $allowedRoles = ['admin', 'manager', 'system_admin', 'super_admin'];
        
        if (!in_array($user->role, $allowedRoles) && 
            (!($user->assignedRole && in_array($user->assignedRole->key, $allowedRoles)))) {
            abort(403, 'Unauthorized access to settings.');
        }
    }

    public function index()
    {
        $this->checkAuth();

        // Return as key-value pairs for easy frontend usage
        $settings = Setting::all()->pluck('value', 'key');
        return response()->json($settings);
    }

    public function update(Request $request)
    {
        $this->checkAuth();

        $data = $request->all();

        // Expecting a JSON object: { "key": "value", "key2": "value2" }
        foreach ($data as $key => $value) {
            // Optional: Define groups based on key prefixes or specific logic
            $group = 'general';
            if (str_contains($key, 'fee') || str_contains($key, 'price') || str_contains($key, 'bank')) {
                $group = 'finance';
            } elseif (str_contains($key, 'notify') || str_contains($key, 'token')) {
                $group = 'notification';
            }

            Setting::updateOrCreate(
                ['key' => $key],
                [
                    'value' => $value,
                    'group' => $group
                ]
            );
        }

        return response()->json(['message' => 'Settings updated successfully']);
    }
}
