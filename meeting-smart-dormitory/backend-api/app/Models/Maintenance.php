<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Maintenance extends Model
{
    use HasFactory;

    protected $primaryKey = 'maintenance_id';

    protected $fillable = [
        'user_id',
        'room_id',
        'damage_details',
        'report_images',
        'repair_type',
        'technician_id',
        'report_date',
        'fix_date',
        'status',
        'payment_status',
        'completion_proof_images',
        'expense_amount',
        'expense_details',
        'expense_receipt_image',
    ];

    protected $casts = [
        'report_date' => 'datetime',
        'fix_date' => 'datetime',
        'completion_proof_images' => 'array',
        'report_images' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function room()
    {
        return $this->belongsTo(Room::class, 'room_id');
    }

    public function technician()
    {
        return $this->belongsTo(User::class, 'technician_id');
    }
}
