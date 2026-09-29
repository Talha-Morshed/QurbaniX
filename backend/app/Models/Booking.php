<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/** Adnan Bin Aman: Stores the customer, service, schedule, price, and status for each booking. */
class Booking extends Model
{
    protected $fillable = [
        'reference',
        'customer_id',
        'butcher_id',
        'service_id',
        'service_date',
        'service_time',
        'address',
        'area',
        'city',
        'instructions',
        'total_amount',
        'advance_amount',
        'remaining_amount',
        'status',
        'payment_status',
        'cancellation_reason',
        'completed_at',
    ];

    protected function casts(): array
    {
        return ['service_date' => 'date', 'completed_at' => 'datetime'];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function butcher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'butcher_id');
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(ButcherService::class, 'service_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function review(): HasOne
    {
        return $this->hasOne(Review::class);
    }
}
