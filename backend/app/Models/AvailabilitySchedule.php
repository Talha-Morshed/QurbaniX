<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Adnan Bin Aman: Stores recurring working hours and booking capacity for a butcher's weekday. */
class AvailabilitySchedule extends Model
{
    protected $fillable = ['butcher_id', 'weekday', 'is_enabled', 'starts_at', 'ends_at', 'capacity'];

    protected function casts(): array
    {
        return ['is_enabled' => 'boolean'];
    }

    public function butcher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'butcher_id');
    }
}
