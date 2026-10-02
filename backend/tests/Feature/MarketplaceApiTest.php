<?php

namespace Tests\Feature;

use App\Models\AvailabilitySchedule;
use App\Models\Booking;
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

        $this->postJson('/api/register', [
            'name' => 'Duplicate Customer',
            'phone' => '01712345678',
            'role' => 'customer',
        ])->assertUnprocessable()->assertJsonValidationErrors('phone');
        $this->assertDatabaseCount('users', 1);
    }

    public function test_newly_registered_customer_can_request_and_verify_pin_with_a_mismatched_selected_role(): void
    {
        $this->app['env'] = 'local';
        $phone = '01712345678';

        $this->postJson('/api/register', [
            'name' => 'Test Customer',
            'phone' => $phone,
            'role' => 'customer',
        ])->assertCreated();

        $this->assertDatabaseHas('users', ['phone' => $phone, 'role' => 'customer']);
        $this->assertDatabaseCount('users', 1);

        $pinResponse = $this->postJson('/api/login', [
            'phone' => $phone,
            'role' => 'butcher',
        ])->assertOk();

        $this->postJson('/api/login/verify', [
            'phone' => $phone,
            'pin' => $pinResponse->json('dev_pin'),
        ])->assertOk()
            ->assertJsonPath('user.phone', $phone)
            ->assertJsonPath('user.role', 'customer')
            ->assertJsonStructure(['token']);
    }

    public function test_newly_registered_butcher_can_request_and_verify_pin_with_a_mismatched_selected_role(): void
    {
        $this->app['env'] = 'local';
        $phone = '01812345678';

        $this->postJson('/api/register', [
            'name' => 'Test Butcher',
            'phone' => $phone,
            'role' => 'butcher',
        ])->assertCreated();

        $this->assertDatabaseHas('users', ['phone' => $phone, 'role' => 'butcher']);

        $pinResponse = $this->postJson('/api/login', [
            'phone' => $phone,
            'role' => 'customer',
        ])->assertOk();

        $this->postJson('/api/login/verify', [
            'phone' => $phone,
            'pin' => $pinResponse->json('dev_pin'),
        ])->assertOk()
            ->assertJsonPath('user.phone', $phone)
            ->assertJsonPath('user.role', 'butcher')
            ->assertJsonStructure(['token']);
    }

    public function test_login_rejects_a_valid_but_nonexistent_phone_number(): void
    {
        $this->postJson('/api/login', [
            'phone' => '01999999999',
            'role' => 'customer',
        ])->assertNotFound()
            ->assertJsonPath('message', 'No account found with this phone number.');
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

    public function test_customer_cash_confirmation_records_payer_confirmation_until_butcher_confirms(): void
    {
        ['customer' => $customer, 'booking' => $booking, 'payment' => $payment] = $this->createPaymentScenario();

        $this->actingAs($customer)
            ->postJson("/api/customer/payments/{$payment->id}/confirm")
            ->assertOk()
            ->assertJsonPath('payment.status', 'pending')
            ->assertJsonPath('booking.payment_status', 'Payment pending');

        $payment = $payment->fresh();
        $this->assertNotNull($payment->payer_confirmed_at);
        $this->assertNull($payment->receiver_confirmed_at);
        $this->assertNull($payment->confirmed_at);
        $this->assertSame('Payment pending', $booking->fresh()->payment_status);
    }

    public function test_customer_confirmation_completes_cash_advance_if_butcher_already_confirmed(): void
    {
        ['customer' => $customer, 'booking' => $booking, 'payment' => $payment] = $this->createPaymentScenario(
            paymentAttributes: ['receiver_confirmed_at' => now()],
        );

        $this->actingAs($customer)
            ->postJson("/api/customer/payments/{$payment->id}/confirm")
            ->assertOk()
            ->assertJsonPath('payment.status', 'paid')
            ->assertJsonPath('booking.payment_status', 'Advance paid');

        $this->assertNotNull($payment->fresh()->confirmed_at);
        $this->assertSame($customer->id, $payment->fresh()->confirmed_by);
        $this->assertSame(8000, $booking->fresh()->remaining_amount);
    }

    public function test_customer_balance_confirmation_marks_booking_paid_in_full_and_clears_remaining_amount(): void
    {
        ['customer' => $customer, 'booking' => $booking, 'payment' => $payment] = $this->createPaymentScenario(
            paymentAttributes: [
                'purpose' => 'balance',
                'amount' => 8000,
                'receiver_confirmed_at' => now(),
            ],
        );

        $this->actingAs($customer)
            ->postJson("/api/customer/payments/{$payment->id}/confirm")
            ->assertOk()
            ->assertJsonPath('payment.status', 'paid')
            ->assertJsonPath('booking.payment_status', 'Paid in full')
            ->assertJsonPath('booking.remaining_amount', 0);

        $this->assertSame(0, $booking->fresh()->remaining_amount);
    }

    public function test_customer_cannot_confirm_another_customers_payment(): void
    {
        ['payment' => $payment] = $this->createPaymentScenario();
        $otherCustomer = User::factory()->create(['role' => 'customer']);

        $this->actingAs($otherCustomer)
            ->postJson("/api/customer/payments/{$payment->id}/confirm")
            ->assertNotFound();

        $this->assertNull($payment->fresh()->payer_confirmed_at);
    }

    public function test_customer_cannot_confirm_an_online_payment(): void
    {
        ['customer' => $customer, 'payment' => $payment] = $this->createPaymentScenario(
            paymentAttributes: ['method' => 'bkash'],
        );

        $this->actingAs($customer)
            ->postJson("/api/customer/payments/{$payment->id}/confirm")
            ->assertUnprocessable();

        $this->assertNull($payment->fresh()->payer_confirmed_at);
    }

    public function test_customer_cannot_confirm_a_payment_for_a_cancelled_booking(): void
    {
        ['customer' => $customer, 'payment' => $payment] = $this->createPaymentScenario(
            bookingAttributes: ['status' => 'Cancelled'],
        );

        $this->actingAs($customer)
            ->postJson("/api/customer/payments/{$payment->id}/confirm")
            ->assertUnprocessable();

        $this->assertNull($payment->fresh()->payer_confirmed_at);
    }

    public function test_duplicate_customer_confirmation_is_rejected_without_changing_payment(): void
    {
        ['customer' => $customer, 'payment' => $payment] = $this->createPaymentScenario(
            paymentAttributes: ['payer_confirmed_at' => now()],
        );

        $this->actingAs($customer)
            ->postJson("/api/customer/payments/{$payment->id}/confirm")
            ->assertStatus(409);

        $this->assertSame('pending', $payment->fresh()->status);
        $this->assertNull($payment->fresh()->receiver_confirmed_at);
        $this->assertDatabaseCount('user_notifications', 0);
    }

    private function createPaymentScenario(array $bookingAttributes = [], array $paymentAttributes = []): array
    {
        $customer = User::factory()->create(['role' => 'customer']);
        $butcher = User::factory()->create(['role' => 'butcher']);
        $service = ButcherService::create([
            'butcher_id' => $butcher->id,
            'name' => 'Goat Qurbani',
            'animal' => 'Goat',
            'category' => 'Slaughter & cutting',
            'price' => 10000,
            'is_available' => true,
        ]);
        $booking = Booking::create(array_merge([
            'reference' => 'QBX-TEST-001',
            'customer_id' => $customer->id,
            'butcher_id' => $butcher->id,
            'service_id' => $service->id,
            'service_date' => now()->addDays(10)->toDateString(),
            'service_time' => '11:00',
            'address' => 'House 10, Road 2',
            'area' => 'Dhanmondi',
            'city' => 'Dhaka',
            'total_amount' => 10000,
            'advance_amount' => 2000,
            'remaining_amount' => 8000,
            'status' => 'Confirmed',
            'payment_status' => 'Payment pending',
        ], $bookingAttributes));
        $payment = $booking->payments()->create(array_merge([
            'payer_id' => $customer->id,
            'amount' => 2000,
            'purpose' => 'advance',
            'method' => 'cash',
            'status' => 'pending',
        ], $paymentAttributes));

        return compact('customer', 'butcher', 'booking', 'payment');
    }
}
