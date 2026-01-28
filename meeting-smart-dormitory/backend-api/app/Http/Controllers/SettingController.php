<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    /**
     * Get all settings grouped by category.
     */
    public function index()
    {
        $settings = Setting::all();
        
        $data = [
            'general' => [],
            'finance' => [],
            'notification' => []
        ];

        // Known keys mapping to ensure legacy data is correctly categorized
        $keyGroups = [
            'water_unit_price' => 'finance',
            'electric_unit_price' => 'finance',
            'line_notify_token' => 'notification',
            'enable_email_notify' => 'notification'
        ];

        foreach ($settings as $setting) {
            // Use fixed group if defined, otherwise use stored group, defaulting to general
            $group = $keyGroups[$setting->key] ?? $setting->group ?? 'general';
            
            if (isset($data[$group])) {
                $data[$group][$setting->key] = $setting->value;
            }
        }

        return response()->json($data);
        
    }
    
    /**
     * Update settings in bulk.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'nullable', // Allow string or numeric
            'settings.*.group' => 'nullable|string'
        ]);

        foreach ($validated['settings'] as $item) {
            $setting = Setting::where('key', $item['key'])->first();
            if ($setting) {
                $setting->update([
                    'value' => $item['value'],
                    'group' => $item['group'] ?? $setting->group
                ]);
            } else {
                Setting::create([
                    'key' => $item['key'],
                    'value' => $item['value'],
                    'group' => $item['group'] ?? 'general',
                    'type' => 'string'
                ]);
            }
        }

        return response()->json(['message' => 'บันทึกการตั้งค่าเรียบร้อย']);
    }
    /**
     * Upload QR Code image.
     */
    public function uploadQr(Request $request)
    {
        // Only Manager (and Admin) should technically access, but Middleware handles role.
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filename = 'promptpay_qr_' . time() . '.' . $file->getClientOriginalExtension();
            // Store in 'public/uploads'
            $path = $file->storeAs('uploads', $filename, 'public');
            
            // Return the accessible URL
            $url = asset('storage/' . $path);
            
            // Generate full URL correctly if asset() is relative or simple path
            // Usually valid if storage linked.
            
            return response()->json([
                'success' => true,
                'url' => $url,
                'path' => $path // For reference
            ]);
        }

        return response()->json(['success' => false, 'message' => 'No file uploaded'], 400);
    }
}
