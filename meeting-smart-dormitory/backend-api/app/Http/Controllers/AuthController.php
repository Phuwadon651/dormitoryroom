<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'username' => 'required',
            'password' => 'required',
        ]);

        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            $user->load('assignedRole'); // Load role relationship
            $token = $user->createToken('auth-token')->plainTextToken;

            // Permissions are now handled directly on the user model via the 'permissions' column
            // We do not override them with role permissions here to allow per-user customization

            return response()->json([
                'success' => true,
                'token' => $token,
                'user' => $user,
                'role' => $user->assignedRole ? $user->assignedRole->key : $user->role, // Return key as role string
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
        ], 401);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['success' => true, 'message' => 'Logged out']);
    }

    public function user(Request $request)
    {
        $user = $request->user();
        $user->load('assignedRole');
        if ($user->assignedRole) {
            // Also override the string role for backward compatibility
            $user->role = $user->assignedRole->key; 
        }
        return $user;
    }
}
