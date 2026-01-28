<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    use HasFactory;

    // protected $primaryKey = 'room_id'; // Removed - using default 'id'


    protected $fillable = [
        'room_number',
        'floor',
        'room_type',
        'price',
        'status',
        'furniture_details'
    ];

    public function tenants()
    {
        return $this->hasMany(Tenant::class);
    }

    public function meterReadings()
    {
        return $this->hasMany(MeterReading::class);
    }
}
