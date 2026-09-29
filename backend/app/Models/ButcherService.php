<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** Adnan Bin Aman: Stores each service's animal, price, duration, and bookable status. */
class ButcherService extends Model
{
    protected $fillable = [
        'butcher_id',
        'name',
        'animal',
        'category',
        'description',
        'price',
        'duration',
        'is_available',
    ];

    protected function casts(): array
    {
        return ['is_available' => 'boolean'];
    }

    public function butcher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'butcher_id');
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'service_id');
    }
}
