<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Adnan Bin Aman: Stores ratings and written feedback for a completed booking. */
class Review extends Model
{
    protected $fillable = [
        'booking_id',
        'customer_id',
        'butcher_id',
        'rating',
        'service_rating',
        'professionalism_rating',
        'punctuality_rating',
        'cleanliness_rating',
        'comment',
        'recommendation',
        'status',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function butcher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'butcher_id');
    }
}
