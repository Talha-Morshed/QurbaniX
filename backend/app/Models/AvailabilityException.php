<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Adnan Bin Aman: Stores one-day availability overrides for holidays and special schedules. */
class AvailabilityException extends Model
{
    protected $fillable = ['butcher_id', 'date', 'is_available', 'starts_at', 'ends_at', 'capacity'];

    protected function casts(): array
    {
        return ['date' => 'date', 'is_available' => 'boolean'];
    }

    public function butcher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'butcher_id');
    }
}
