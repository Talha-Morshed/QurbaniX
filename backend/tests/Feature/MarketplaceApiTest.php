<?php

namespace Tests\Feature;

use App\Models\AvailabilitySchedule;
use App\Models\ButcherService;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

/** Adnan: Check that API flows persist real data and enforce account access and booking rules. */
class MarketplaceApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_butcher_catalog_has_no_seeded_demo_records(): void
    {
        $this->getJson('/api/butchers')
            ->assertOk()
            ->assertJsonPath('data', []);
    }

    public function test_customer_registration_persists_a_real_account_and_token(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Test Customer',
            'phone' => '01712345678',
            'role' => 'customer',
        ]);

        $response->assertCreated()
            ->assertJsonPath('user.name', 'Test Customer')
            ->assertJsonStructure(['token', 'user' => ['id', 'name', 'phone', 'role']]);
        $this->assertDatabaseHas('users', ['phone' => '01712345678', 'role' => 'customer']);
        $this->assertDatabaseCount('bookings', 0);
    }

    public function test_customers_cannot_manage_butcher_services(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);

        $this->actingAs($customer)
            ->getJson('/api/butcher/services')
            ->assertForbidden();
    }

    public function test_only_verified_butchers_with_available_services_are_in_the_public_directory(): void
    {
        $butcher = User::factory()->create(['role' => 'butcher']);
        $butcher->butcherProfile()->create([
            'area' => 'Gulshan',
            'city' => 'Dhaka',
            'verification_status' => 'verified',
            'verified_at' => now(),
        ]);
        ButcherService::create([
            'butcher_id' => $butcher->id,
            'name' => 'Goat Qurbani',
            'animal' => 'Goat',
            'category' => 'Slaughter & cutting',
            'price' => 4200,
            'is_available' => true,
        ]);

        $this->getJson('/api/butchers?animal=Goat&area=Gulshan&sort=price-low')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $butcher->id);

        $this->getJson('/api/butchers?minimum_rating=4.5')
            ->assertOk()
            ->assertJsonPath('data', []);
    }

    public function test_login_limits_incorrect_pin_attempts(): void
    {
        $user = User::factory()->create([
            'phone' => '01755550123',
            'pin_hash' => Hash::make('1234'),
            'pin_expires_at' => now()->addMinutes(5),
            'pin_attempts' => 0,
        ]);

        foreach ([401, 401, 429] as $status) {
            $this->postJson('/api/login/verify', ['phone' => $user->phone, 'pin' => '0000'])
                ->assertStatus($status);
        }

        $this->assertDatabaseHas('users', ['id' => $user->id, 'pin_attempts' => 3]);
    }

    public function test_booking_is_persisted_and_not_marked_paid_before_payment(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);
        $butcher = User::factory()->create(['role' => 'butcher']);
        $butcher->butcherProfile()->create([
            'area' => 'Dhanmondi',
            'city' => 'Dhaka',
            'verification_status' => 'verified',
            'verified_at' => now(),
        ]);
        $service = ButcherService::create([
            'butcher_id' => $butcher->id,
            'name' => 'Goat Qurbani',
            'animal' => 'Goat',
            'category' => 'Slaughter & cutting',
            'price' => 3500,
            'is_available' => true,
        ]);
        $serviceDate = now()->addDays(10);
        AvailabilitySchedule::create([
            'butcher_id' => $butcher->id,
            'weekday' => (int) $serviceDate->format('w'),
            'is_enabled' => true,
            'starts_at' => '09:00',
            'ends_at' => '17:00',
            'capacity' => 4,
        ]);

        $this->actingAs($customer)
            ->postJson('/api/customer/bookings', [
                'service_id' => $service->id,
                'service_date' => $serviceDate->toDateString(),
                'service_time' => '11:00',
                'address' => 'House 10, Road 2',
                'area' => 'Dhanmondi',
                'city' => 'Dhaka',
            ])
            ->assertCreated()
            ->assertJsonPath('booking.status', 'Pending')
            ->assertJsonPath('booking.payment_status', 'Unpaid')
            ->assertJsonPath('booking.total_amount', 3500);

        $this->assertDatabaseCount('bookings', 1);
        $this->assertDatabaseCount('user_notifications', 1);
    }
}
