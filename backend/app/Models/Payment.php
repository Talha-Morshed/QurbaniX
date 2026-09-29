<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Adnan Bin Aman: Stores amounts due and separate payer/receiver payment confirmations. */
class Payment extends Model
{
    protected $fillable = [
        'booking_id',
        'payer_id',
        'amount',
        'purpose',
        'method',
        'status',
        'provider_reference',
        'confirmed_by',
        'confirmed_at',
        'payer_confirmed_at',
        'receiver_confirmed_at',
    ];

    protected function casts(): array
    {
        return [
            'confirmed_at' => 'datetime',
            'payer_confirmed_at' => 'datetime',
            'receiver_confirmed_at' => 'datetime',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function payer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'payer_id');
    }
}
