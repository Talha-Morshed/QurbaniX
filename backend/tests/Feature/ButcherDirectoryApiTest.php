<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ButcherDirectoryApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_butcher_details_include_full_rating_distribution_and_real_review_service(): void
    {
        $butcher = User::factory()->create(['role' => 'butcher']);
        $butcher->butcherProfile()->create([
            'area' => 'Dhanmondi',
            'city' => 'Dhaka',
            'verification_status' => 'verified',
        ]);
        $service = $butcher->services()->create([
            'name' => 'Goat Qurbani',
            'animal' => 'Goat',
            'category' => 'Slaughter & cutting',
            'price' => 4800,
            'is_available' => true,
        ]);

        foreach ([5, 4, 5] as $rating) {
            $customer = User::factory()->create(['role' => 'customer']);
            $booking = Booking::create([
                'reference' => 'QBX-'.fake()->unique()->numerify('########'),
                'customer_id' => $customer->id,
                'butcher_id' => $butcher->id,
                'service_id' => $service->id,
                'service_date' => now()->toDateString(),
                'service_time' => '10:00',
                'address' => 'Dhanmondi',
                'area' => 'Dhanmondi',
                'city' => 'Dhaka',
                'total_amount' => 4800,
                'advance_amount' => 960,
                'remaining_amount' => 3840,
                'status' => 'Completed',
                'payment_status' => 'Unpaid',
            ]);
            $booking->review()->create([
                'customer_id' => $customer->id,
                'butcher_id' => $butcher->id,
                'rating' => $rating,
                'comment' => 'Good service and careful preparation.',
                'status' => 'published',
            ]);
        }

        $this->getJson("/api/butchers/{$butcher->id}")
            ->assertOk()
            ->assertJsonPath('rating_distribution.5', 2)
            ->assertJsonPath('rating_distribution.4', 1)
            ->assertJsonPath('reviews.data.0.booking.service.name', 'Goat Qurbani');
    }
}
