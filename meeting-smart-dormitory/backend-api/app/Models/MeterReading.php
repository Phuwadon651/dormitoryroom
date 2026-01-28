<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MeterReading extends Model
{
    use HasFactory;

    protected $fillable = [
        'room_id',
        'reading_date',
        'electricity_meter',
        'water_meter',
        'recorded_by',
        'note'
    ];

    protected $casts = [
        'reading_date' => 'date',
        'electricity_meter' => 'decimal:2',
        'water_meter' => 'decimal:2',
    ];

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    public function recorder()
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
