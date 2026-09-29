<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** Adnan Bin Aman: Stores a butcher's public details, verification state, and availability settings. */
class ButcherProfile extends Model
{
    protected $fillable = [
        'user_id',
        'bio',
        'area',
        'city',
        'service_areas',
        'specializations',
        'verification_status',
        'verified_at',
        'is_available',
        'daily_capacity',
    ];

    protected function casts(): array
    {
        return [
            'service_areas' => 'array',
            'specializations' => 'array',
            'verified_at' => 'datetime',
            'is_available' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function services(): HasMany
    {
        return $this->hasMany(ButcherService::class, 'butcher_id', 'user_id');
    }
}
