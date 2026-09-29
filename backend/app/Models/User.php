<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/** Adnan Bin Aman: Stores accounts, login data, and relationships to marketplace records. */
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'phone',
        'role',
        'email',
        'password',
        'pin_hash',
        'pin_expires_at',
        'pin_attempts',
        'preferences',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'pin_hash',
        'pin_attempts',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'pin_expires_at' => 'datetime',
            'password' => 'hashed',
            'preferences' => 'array',
        ];
    }

    public function butcherProfile(): HasOne
    {
        return $this->hasOne(ButcherProfile::class);
    }

    public function services(): HasMany
    {
        return $this->hasMany(ButcherService::class, 'butcher_id');
    }

    public function customerAddresses(): HasMany
    {
        return $this->hasMany(CustomerAddress::class);
    }

    public function customerBookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'customer_id');
    }

    public function butcherBookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'butcher_id');
    }

    public function userNotifications(): HasMany
    {
        return $this->hasMany(UserNotification::class);
    }

    public function availabilitySchedules(): HasMany
    {
        return $this->hasMany(AvailabilitySchedule::class, 'butcher_id');
    }

    public function availabilityExceptions(): HasMany
    {
        return $this->hasMany(AvailabilityException::class, 'butcher_id');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class, 'butcher_id');
    }
}
