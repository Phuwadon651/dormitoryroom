<?php

namespace App\Http\Controllers;

use App\Models\MeterReading;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class MeterReadingController extends Controller
{
    /**
     * Get a summary of reading status for a given month/year.
     */
    public function summary(Request $request)
    {
        $month = $request->input('month', Carbon::now()->month);
        $year = $request->input('year', Carbon::now()->year);

        $start = Carbon::createFromDate($year, $month, 1)->startOfMonth();
        $end = Carbon::createFromDate($year, $month, 1)->endOfMonth();

        $totalRooms = Room::count();
        // $occupiedRooms = Room::where('status', 'ไม่ว่าง')->count();
        $occupiedRooms = Room::whereHas('tenants', function($q) {
            $q->where('status', 'Active');
        })->count();
        
        // Rooms that have a reading for this month (using date range)
        $currentReadings = MeterReading::whereBetween('reading_date', [$start, $end])->get();
        $readingsCount = $currentReadings->unique('room_id')->count();

        $pending = $occupiedRooms - $readingsCount; 

        // Calculate Usage (Consumption)
        $totalElecUsage = 0;
        $totalWaterUsage = 0;

        foreach ($currentReadings as $reading) {
             $prev = MeterReading::where('room_id', $reading->room_id)
                 ->where('reading_date', '<', $reading->reading_date)
                 ->orderBy('reading_date', 'desc')
                 ->first();
             
             if ($prev) {
                 $totalElecUsage += max(0, $reading->electricity_meter - $prev->electricity_meter);
                 $totalWaterUsage += max(0, $reading->water_meter - $prev->water_meter);
             }
        }

        return response()->json([
            'month' => $month,
            'year' => $year,
            'total_rooms' => $totalRooms,
            'occupied_rooms' => $occupiedRooms,
            'recorded_rooms' => $readingsCount,
            'pending_rooms' => max(0, $pending),
            'total_electricity_meter' => $totalElecUsage,
            'total_water_meter' => $totalWaterUsage,
        ]);
    }

    /**
     * List rooms with their reading status for a specific month.
     */
    public function index(Request $request)
    {
        $month = $request->input('month', Carbon::now()->month);
        $year = $request->input('year', Carbon::now()->year);

        $start = Carbon::createFromDate($year, $month, 1)->startOfMonth();
        $end = Carbon::createFromDate($year, $month, 1)->endOfMonth();

        // Get all rooms with specific month reading
        $rooms = Room::with(['tenants' => function($q) {
                $q->where('status', 'Active');
            }, 'meterReadings' => function($q) use ($start, $end) {
                $q->whereBetween('reading_date', [$start, $end]);
            }])
            ->orderBy('floor')
            ->orderBy('room_number')
            ->get();
            
        // Map to cleaner format
        $data = $rooms->map(function($room) {
             $reading = $room->meterReadings->first(); // Should be only one if constraints are met logic-wise
             
             return [
                 'room_id' => $room->id,
                 'room_number' => $room->room_number,
                 'floor' => $room->floor,
                 'status' => $room->tenants->isNotEmpty() ? 'ไม่ว่าง' : 'ว่าง', // Priority to relationship
                 'has_tenant' => $room->tenants->isNotEmpty(),
                 'tenant_name' => $room->tenants->isNotEmpty() ? $room->tenants->first()->name : null,
                 'reading' => $reading ? [
                     'id' => $reading->id,
                     'electricity' => $reading->electricity_meter,
                     'water' => $reading->water_meter,
                     'date' => $reading->reading_date ? $reading->reading_date->format('Y-m-d') : null
                 ] : null
             ];
        });

        return response()->json($data);
    }

    /**
     * Store or update a reading.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'electricity_meter' => 'required|numeric|min:0',
            'water_meter' => 'required|numeric|min:0',
            'reading_date' => 'required|date',
        ]);

        // Check if reading exists for this month to update it, or create new
        $date = Carbon::parse($validated['reading_date']);
        
        $reading = MeterReading::where('room_id', $validated['room_id'])
            ->whereYear('reading_date', $date->year)
            ->whereMonth('reading_date', $date->month)
            ->first();

        if ($reading) {
            $reading->update([
                'electricity_meter' => $validated['electricity_meter'],
                'water_meter' => $validated['water_meter'],
                'reading_date' => $validated['reading_date'], // In case day changed
                'recorded_by' => $request->user()->id,
            ]);
        } else {
            $reading = MeterReading::create([
                'room_id' => $validated['room_id'],
                'electricity_meter' => $validated['electricity_meter'],
                'water_meter' => $validated['water_meter'],
                'reading_date' => $validated['reading_date'],
                'recorded_by' => $request->user()->id,
            ]);
        }

        return response()->json(['message' => 'บันทึกเรียบร้อย', 'data' => $reading]);
    }
    
    /** 
     * Get history for a room
     */
    public function history($roomId)
    {
        $readings = MeterReading::where('room_id', $roomId)
            ->orderBy('reading_date', 'desc')
            ->take(12)
            ->get();
            
        return response()->json($readings);
    }

    /**
     * Delete a reading.
     */
    public function destroy($id)
    {
        $reading = MeterReading::findOrFail($id);
        $reading->delete();

        return response()->json(['message' => 'Reading deleted successfully']);
    }
}
