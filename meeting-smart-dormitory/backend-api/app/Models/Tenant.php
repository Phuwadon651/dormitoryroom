<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Tenant extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'phone',
        'room_id',
        'status',
        'email',
        'line_id',
        'move_in_date',
        'user_id',
        'plain_password',
    ];

    protected $casts = [
        'move_in_date' => 'date',
    ];

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function contracts(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Contract::class);
    }
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
