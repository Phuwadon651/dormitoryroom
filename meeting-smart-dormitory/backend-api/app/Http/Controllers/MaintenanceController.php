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
            'room_id' => 'required|exists:rooms,id',
            'damage_details' => 'required|string',
            'repair_type' => 'required|string',
            'report_date' => 'required|date',
            'report_images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $reportImages = [];
        if ($request->hasFile('report_images')) {
            foreach ($request->file('report_images') as $image) {
                // Store in 'public' disk (storage/app/public/maintenance_reports)
                $path = $image->store('maintenance_reports', 'public');
                $reportImages[] = $path;
            }
        }

        $maintenance = Maintenance::create([
            'user_id' => Auth::id(),
            'room_id' => $validated['room_id'],
            'damage_details' => $validated['damage_details'],
            'repair_type' => $validated['repair_type'],
            'report_date' => $validated['report_date'],
            'status' => 'pending',
            'report_images' => $reportImages,
        ]);

        return response()->json($maintenance, 201);
    }

    public function accept($id)
    {
        $maintenance = Maintenance::findOrFail($id);
        
        // Ensure user is a technician?
        // if (Auth::user()->role !== 'Technician') { ... }

        $maintenance->update([
            'technician_id' => Auth::id(),
            'status' => 'in_progress',
        ]);

        return response()->json($maintenance);
    }

    public function complete(Request $request, $id)
    {
        $maintenance = Maintenance::findOrFail($id);

        $validated = $request->validate([
            'completion_proof_images.*' => 'required|image|max:2048',
            'expense_amount' => 'nullable|numeric',
            'expense_details' => 'nullable|string',
            'expense_receipt_image' => 'nullable|image|max:2048',
        ]);

        $proofImages = [];
        if ($request->hasFile('completion_proof_images')) {
            foreach ($request->file('completion_proof_images') as $image) {
                $path = $image->store('maintenance_proofs', 'public');
                $proofImages[] = $path;
            }
        }

        $receiptPath = null;
        if ($request->hasFile('expense_receipt_image')) {
            $receiptPath = $request->file('expense_receipt_image')->store('maintenance_receipts', 'public');
        }

        $maintenance->update([
            'status' => 'completed', 
            'fix_date' => now(),
            'completion_proof_images' => $proofImages,
            'expense_amount' => $request->expense_amount,
            'expense_details' => $request->expense_details,
            'expense_receipt_image' => $receiptPath,
        ]);

        return response()->json($maintenance);
    }

    public function pay($id)
    {
        // Add authorization check if needed
        $maintenance = Maintenance::findOrFail($id);
        $maintenance->update(['payment_status' => 'paid']);
        return response()->json($maintenance);
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
