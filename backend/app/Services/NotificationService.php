<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\User;

/** Adnan Bin Aman: Saves user-facing notifications for marketplace events. */
class NotificationService
{
    /** Adnan: Attach each notification to its recipient and, when relevant, its booking. */
    public function send(User $recipient, string $type, string $title, string $message, ?Booking $booking = null): void
    {
        $recipient->userNotifications()->create([
            'booking_id' => $booking?->id,
            'type' => $type,
            'title' => $title,
            'message' => $message,
        ]);
    }
}
