<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Invoice extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'contract_id',
        'period_month',
        'period_year',
        'water_prev',
        'water_curr',
        'water_unit_price',
        'water_total',
        'electric_prev',
        'electric_curr',
        'electric_unit_price',
        'electric_total',
        'rent_total',
        'common_fee',
        'parking_fee',
        'internet_fee',
        'cleaning_fee',
        'other_fees',
        'total_amount',
        'status',
    ];

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}
