<?php

namespace Tests\Feature;

use App\Models\AvailabilitySchedule;
use App\Models\Booking;
use App\Models\ButcherService;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
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

    public function test_customer_login_requires_the_customer_role_and_does_not_issue_a_token_for_butcher_verification(): void
    {
        $this->app['env'] = 'local';
        $phone = '01712345678';

        $this->postJson('/api/register', [
            'name' => 'Test Customer',
            'phone' => $phone,
            'role' => 'customer',
        ])->assertCreated();

        $pinResponse = $this->postJson('/api/login', [
            'phone' => $phone,
            'role' => 'customer',
        ])->assertOk();

        $this->postJson('/api/login/verify', [
            'phone' => $phone,
            'pin' => $pinResponse->json('dev_pin'),
            'role' => 'butcher',
        ])->assertForbidden()
            ->assertJsonPath('message', 'This account cannot be used with the selected login role.')
            ->assertJsonMissingPath('token');
    }

    public function test_butcher_login_requires_the_butcher_role_and_does_not_issue_a_token_for_customer_verification(): void
    {
        $this->app['env'] = 'local';
        $phone = '01812345678';

        $this->postJson('/api/register', [
            'name' => 'Test Butcher',
            'phone' => $phone,
            'role' => 'butcher',
        ])->assertCreated();

        $pinResponse = $this->postJson('/api/login', [
            'phone' => $phone,
            'role' => 'butcher',
        ])->assertOk();

        $this->postJson('/api/login/verify', [
            'phone' => $phone,
            'pin' => $pinResponse->json('dev_pin'),
            'role' => 'customer',
        ])->assertForbidden()
            ->assertJsonPath('message', 'This account cannot be used with the selected login role.')
            ->assertJsonMissingPath('token');
    }

    public function test_customer_can_request_and_verify_pin_with_the_customer_role(): void
    {
        $this->app['env'] = 'local';
        $phone = '01712345679';

        $this->postJson('/api/register', [
            'name' => 'Customer Login User',
            'phone' => $phone,
            'role' => 'customer',
        ])->assertCreated();

        $pinResponse = $this->postJson('/api/login', [
            'phone' => $phone,
            'role' => 'customer',
        ])->assertOk();

        $this->postJson('/api/login/verify', [
            'phone' => $phone,
            'pin' => $pinResponse->json('dev_pin'),
            'role' => 'customer',
        ])->assertOk()
            ->assertJsonPath('user.phone', $phone)
            ->assertJsonPath('user.role', 'customer')
            ->assertJsonStructure(['token']);
    }

    public function test_butcher_can_request_and_verify_pin_with_the_butcher_role(): void
    {
        $this->app['env'] = 'local';
        $phone = '01812345679';

        $this->postJson('/api/register', [
            'name' => 'Butcher Login User',
            'phone' => $phone,
            'role' => 'butcher',
        ])->assertCreated();

        $pinResponse = $this->postJson('/api/login', [
            'phone' => $phone,
            'role' => 'butcher',
        ])->assertOk();

        $this->postJson('/api/login/verify', [
            'phone' => $phone,
            'pin' => $pinResponse->json('dev_pin'),
            'role' => 'butcher',
        ])->assertOk()
            ->assertJsonPath('user.phone', $phone)
            ->assertJsonPath('user.role', 'butcher')
            ->assertJsonStructure(['token']);
    }

    public function test_demo_pin_is_returned_outside_the_local_environment(): void
    {
        $this->app['env'] = 'production';
        $user = User::factory()->create(['phone' => '01712345680', 'role' => 'customer']);

        $this->postJson('/api/login', [
            'phone' => $user->phone,
            'role' => 'customer',
        ])->assertOk()
            ->assertJsonPath('message', 'PIN sent successfully.')
            ->assertJsonStructure(['dev_pin']);
    }

    public function test_admin_can_request_and_verify_pin_with_the_admin_role(): void
    {
        $this->app['env'] = 'local';
        $admin = User::factory()->create(['phone' => '01912345678', 'role' => 'admin']);

        $pinResponse = $this->postJson('/api/login', [
            'phone' => $admin->phone,
            'role' => 'admin',
        ])->assertOk();

        $this->postJson('/api/login/verify', [
            'phone' => $admin->phone,
            'pin' => $pinResponse->json('dev_pin'),
            'role' => 'admin',
        ])->assertOk()
            ->assertJsonPath('user.phone', $admin->phone)
            ->assertJsonPath('user.role', 'admin')
            ->assertJsonStructure(['token']);
    }

    public function test_customer_cannot_access_admin_functionality(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);

        $this->actingAs($customer)
            ->getJson('/api/admin/users')
            ->assertForbidden();
    }

    public function test_butcher_cannot_access_admin_functionality(): void
    {
        $butcher = User::factory()->create(['role' => 'butcher']);

        $this->actingAs($butcher)
            ->getJson('/api/admin/users')
            ->assertForbidden();
    }

    public function test_admin_can_verify_a_pending_butcher(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $butcher = User::factory()->create(['role' => 'butcher']);
        $butcher->butcherProfile()->create([
            'area' => 'Dhanmondi',
            'city' => 'Dhaka',
            'verification_status' => 'pending',
        ]);

        $this->actingAs($admin)
            ->patchJson("/api/admin/butchers/{$butcher->id}/verification", [
                'verification_status' => 'verified',
            ])
            ->assertOk()
            ->assertJsonPath('profile.verification_status', 'verified');

        $this->assertSame('verified', $butcher->fresh()->butcherProfile->verification_status);

        $this->getJson('/api/butchers')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_pending_and_rejected_butchers_remain_excluded_from_the_verified_directory(): void
    {
        $verified = User::factory()->create(['role' => 'butcher']);
        $verified->butcherProfile()->create([
            'area' => 'Gulshan',
            'city' => 'Dhaka',
            'verification_status' => 'verified',
        ]);

        $pending = User::factory()->create(['role' => 'butcher']);
        $pending->butcherProfile()->create([
            'area' => 'Uttara',
            'city' => 'Dhaka',
            'verification_status' => 'pending',
        ]);

        $rejected = User::factory()->create(['role' => 'butcher']);
        $rejected->butcherProfile()->create([
            'area' => 'Mirpur',
            'city' => 'Dhaka',
            'verification_status' => 'rejected',
        ]);

        $this->getJson('/api/butchers')
            ->assertOk()
            ->assertJsonPath('data.0.id', $verified->id)
            ->assertJsonMissingPath('data.1');
    }

    public function test_customer_booking_history_and_details_are_limited_to_the_signed_in_customer(): void
    {
        ['customer' => $customer, 'booking' => $booking] = $this->createPaymentScenario();
        ['booking' => $anotherCustomersBooking] = $this->createPaymentScenario();

        $this->actingAs($customer)
            ->getJson('/api/customer/bookings')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $booking->id)
            ->assertJsonPath('data.0.reference', $booking->reference);

        $this->getJson("/api/customer/bookings/{$booking->id}")
            ->assertOk()
            ->assertJsonPath('booking.id', $booking->id)
            ->assertJsonPath('booking.service.name', 'Goat Qurbani');

        $this->getJson("/api/customer/bookings/{$anotherCustomersBooking->id}")
            ->assertNotFound();
    }

    public function test_butcher_can_list_only_their_bookings_with_customer_service_and_payment_details(): void
    {
        ['butcher' => $butcher, 'booking' => $booking, 'customer' => $customer, 'payment' => $payment] = $this->createPaymentScenario();
        $this->createPaymentScenario();

        $this->actingAs($butcher)
            ->getJson('/api/butcher/bookings')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $booking->id)
            ->assertJsonPath('data.0.reference', $booking->reference)
            ->assertJsonPath('data.0.customer.id', $customer->id)
            ->assertJsonPath('data.0.customer.name', $customer->name)
            ->assertJsonPath('data.0.service.name', 'Goat Qurbani')
            ->assertJsonPath('data.0.payments.0.id', $payment->id);
    }

    public function test_butcher_can_view_only_their_own_booking_details(): void
    {
        ['butcher' => $butcher, 'booking' => $booking] = $this->createPaymentScenario();
        ['booking' => $anotherBooking] = $this->createPaymentScenario();

        $this->actingAs($butcher)
            ->getJson("/api/butcher/bookings/{$booking->id}")
            ->assertOk()
            ->assertJsonPath('booking.id', $booking->id)
            ->assertJsonPath('booking.reference', $booking->reference)
            ->assertJsonPath('booking.service.name', 'Goat Qurbani');

        $this->getJson("/api/butcher/bookings/{$anotherBooking->id}")
            ->assertNotFound();
    }

    public function test_butcher_booking_management_requires_authentication_and_butcher_role(): void
    {
        ['booking' => $booking] = $this->createPaymentScenario();

        $this->getJson('/api/butcher/bookings')->assertUnauthorized();
        $this->getJson("/api/butcher/bookings/{$booking->id}")->assertUnauthorized();
        $this->patchJson("/api/butcher/bookings/{$booking->id}/status", ['status' => 'Confirmed'])->assertUnauthorized();

        $customer = User::factory()->create(['role' => 'customer']);
        $this->actingAs($customer)
            ->getJson('/api/butcher/bookings')
            ->assertForbidden();
        $this->getJson("/api/butcher/bookings/{$booking->id}")
            ->assertForbidden();
        $this->patchJson("/api/butcher/bookings/{$booking->id}/status", ['status' => 'Confirmed'])
            ->assertForbidden();
    }

    public function test_butcher_can_progress_booking_through_allowed_statuses_and_customer_sees_updates(): void
    {
        ['butcher' => $butcher, 'customer' => $customer, 'booking' => $booking] = $this->createPaymentScenario(
            bookingAttributes: ['status' => 'Pending'],
        );

        $this->actingAs($butcher)
            ->patchJson("/api/butcher/bookings/{$booking->id}/status", ['status' => 'Confirmed'])
            ->assertOk()
            ->assertJsonPath('booking.status', 'Confirmed');

        $this->patchJson("/api/butcher/bookings/{$booking->id}/status", ['status' => 'In Progress'])
            ->assertOk()
            ->assertJsonPath('booking.status', 'In Progress');

        $this->patchJson("/api/butcher/bookings/{$booking->id}/status", ['status' => 'Completed'])
            ->assertOk()
            ->assertJsonPath('booking.status', 'Completed');

        $this->actingAs($customer)
            ->getJson('/api/customer/bookings')
            ->assertOk()
            ->assertJsonPath('data.0.id', $booking->id)
            ->assertJsonPath('data.0.status', 'Completed');
    }

    public function test_butcher_booking_status_rejects_invalid_transitions_and_foreign_bookings(): void
    {
        ['butcher' => $butcher, 'booking' => $booking] = $this->createPaymentScenario(
            bookingAttributes: ['status' => 'Pending'],
        );
        ['booking' => $anotherBooking] = $this->createPaymentScenario(
            bookingAttributes: ['status' => 'Pending'],
        );

        $this->actingAs($butcher)
            ->patchJson("/api/butcher/bookings/{$booking->id}/status", ['status' => 'Completed'])
            ->assertUnprocessable();

        $this->assertSame('Pending', $booking->fresh()->status);

        $this->patchJson("/api/butcher/bookings/{$anotherBooking->id}/status", ['status' => 'Confirmed'])
            ->assertNotFound();

        $this->patchJson('/api/butcher/bookings/999999/status', ['status' => 'Confirmed'])
            ->assertNotFound();
    }

    public function test_customer_reviews_require_ownership_completion_and_valid_fields_and_cannot_be_duplicated(): void
    {
        ['customer' => $customer, 'butcher' => $butcher, 'booking' => $completedBooking] = $this->createPaymentScenario(
            bookingAttributes: ['status' => 'Completed', 'completed_at' => now()],
        );
        ['booking' => $pendingBooking] = $this->createPaymentScenario(
            bookingAttributes: ['customer_id' => $customer->id, 'status' => 'Pending'],
        );
        ['booking' => $invalidReviewBooking] = $this->createPaymentScenario(
            bookingAttributes: ['customer_id' => $customer->id, 'status' => 'Completed', 'completed_at' => now()],
        );
        $payload = [
            'rating' => 5,
            'service_rating' => 4,
            'professionalism_rating' => 5,
            'punctuality_rating' => 4,
            'cleanliness_rating' => 5,
            'comment' => 'Excellent service from start to finish.',
            'recommendation' => 'yes',
        ];

        $this->actingAs($customer)
            ->postJson("/api/customer/bookings/{$completedBooking->id}/reviews", $payload)
            ->assertCreated()
            ->assertJsonPath('review.rating', 5)
            ->assertJsonPath('review.recommendation', 'yes');

        $this->getJson('/api/customer/reviews')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.booking.reference', $completedBooking->reference);

        $this->postJson("/api/customer/bookings/{$completedBooking->id}/reviews", $payload)
            ->assertStatus(409);

        $this->postJson("/api/customer/bookings/{$pendingBooking->id}/reviews", $payload)
            ->assertUnprocessable();

        $this->postJson("/api/customer/bookings/{$invalidReviewBooking->id}/reviews", [
            ...$payload,
            'rating' => 6,
            'comment' => 'Bad',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['rating', 'comment']);

        $otherCustomer = User::factory()->create(['role' => 'customer']);
        $this->actingAs($otherCustomer)
            ->postJson("/api/customer/bookings/{$completedBooking->id}/reviews", $payload)
            ->assertNotFound();

        $this->actingAs($butcher)
            ->getJson('/api/butcher/reviews')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.booking.reference', $completedBooking->reference)
            ->assertJsonPath('data.0.customer.name', $customer->name)
            ->assertJsonPath('data.0.rating', 5)
            ->assertJsonPath('data.0.service_rating', 4)
            ->assertJsonPath('data.0.professionalism_rating', 5)
            ->assertJsonPath('data.0.punctuality_rating', 4)
            ->assertJsonPath('data.0.cleanliness_rating', 5)
            ->assertJsonPath('data.0.comment', 'Excellent service from start to finish.')
            ->assertJsonPath('data.0.recommendation', 'yes')
            ->assertJsonPath('data.0.booking.service.name', 'Goat Qurbani');
    }

    public function test_butcher_reviews_require_butcher_authentication_and_are_scoped_to_the_authenticated_butcher(): void
    {
        ['butcher' => $butcher, 'booking' => $booking, 'customer' => $customer] = $this->createPaymentScenario();
        ['butcher' => $anotherButcher, 'booking' => $anotherBooking] = $this->createPaymentScenario();
        $review = $booking->review()->create([
            'customer_id' => $customer->id,
            'butcher_id' => $butcher->id,
            'rating' => 4,
            'service_rating' => 5,
            'comment' => 'Excellent service and clear communication.',
            'recommendation' => 'yes',
            'status' => 'published',
        ]);
        $anotherCustomer = User::factory()->create(['role' => 'customer']);
        $anotherBooking->review()->create([
            'customer_id' => $anotherCustomer->id,
            'butcher_id' => $anotherButcher->id,
            'rating' => 2,
            'comment' => 'Needs improvement.',
            'status' => 'published',
        ]);

        $this->getJson('/api/butcher/reviews')->assertUnauthorized();

        $customerUser = User::factory()->create(['role' => 'customer']);
        $this->actingAs($customerUser)
            ->getJson('/api/butcher/reviews')
            ->assertForbidden();

        $this->actingAs($butcher)
            ->getJson('/api/butcher/reviews?butcher_id='.$anotherButcher->id)
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $review->id)
            ->assertJsonPath('data.0.butcher_id', $butcher->id)
            ->assertJsonPath('data.0.booking.reference', $booking->reference)
            ->assertJsonMissing(['rating' => 2]);
    }

    public function test_customer_notifications_are_scoped_and_read_actions_persist(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);
        $anotherCustomer = User::factory()->create(['role' => 'customer']);
        $notification = $customer->userNotifications()->create([
            'type' => 'booking',
            'title' => 'Booking confirmed',
            'message' => 'Your booking is confirmed.',
        ]);
        $anotherCustomersNotification = $anotherCustomer->userNotifications()->create([
            'type' => 'booking',
            'title' => 'Private notification',
            'message' => 'This belongs to another customer.',
        ]);

        $this->actingAs($customer)
            ->getJson('/api/customer/notifications')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $notification->id)
            ->assertJsonPath('data.0.read_at', null);

        $this->patchJson("/api/customer/notifications/{$notification->id}/read")
            ->assertOk()
            ->assertJsonPath('notification.id', $notification->id);
        $this->assertNotNull($notification->fresh()->read_at);

        $this->patchJson('/api/customer/notifications/read-all')->assertOk();
        $allReadResponse = $this->getJson('/api/customer/notifications')
            ->assertOk()
            ->assertJsonCount(1, 'data');
        $this->assertNotNull($allReadResponse->json('data.0.read_at'));

        $this->patchJson("/api/customer/notifications/{$anotherCustomersNotification->id}/read")
            ->assertNotFound();
    }

    public function test_customer_profile_preferences_and_addresses_use_persisted_customer_data(): void
    {
        $customer = User::factory()->create(['role' => 'customer', 'name' => 'Original Name']);
        $anotherCustomer = User::factory()->create(['role' => 'customer']);

        $this->actingAs($customer)
            ->getJson('/api/customer/profile')
            ->assertOk()
            ->assertJsonPath('user.id', $customer->id)
            ->assertJsonPath('user.name', 'Original Name');

        $this->putJson('/api/customer/profile', [
            'name' => 'Updated Name',
            'email' => 'updated@example.test',
            'preferences' => [
                'booking_updates' => false,
                'payment_updates' => true,
                'butcher_messages' => false,
                'review_notifications' => true,
                'promotions' => true,
            ],
        ])->assertOk()
            ->assertJsonPath('user.name', 'Updated Name')
            ->assertJsonPath('preferences.booking_updates', false)
            ->assertJsonPath('preferences.promotions', true);

        $addressResponse = $this->postJson('/api/customer/addresses', [
            'label' => 'Home',
            'address' => 'House 10, Road 2',
            'area' => 'Dhanmondi',
            'city' => 'Dhaka',
            'instructions' => 'Call on arrival.',
        ])->assertCreated()
            ->assertJsonPath('address.address', 'House 10, Road 2');
        $addressId = $addressResponse->json('address.id');

        $this->putJson("/api/customer/addresses/{$addressId}", [
            'address' => 'House 12, Road 3',
            'area' => 'Gulshan',
            'city' => 'Dhaka',
        ])->assertOk()
            ->assertJsonPath('address.address', 'House 12, Road 3');

        $this->actingAs($anotherCustomer)
            ->putJson("/api/customer/addresses/{$addressId}", ['area' => 'Uttara'])
            ->assertNotFound();

        $this->actingAs($customer)
            ->deleteJson("/api/customer/addresses/{$addressId}")
            ->assertOk();
        $this->assertDatabaseMissing('customer_addresses', ['id' => $addressId]);
        $this->assertSame('Updated Name', $customer->fresh()->name);
        $this->assertFalse($customer->fresh()->preferences['booking_updates']);
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

    public function test_booking_rejects_a_time_at_the_exclusive_schedule_end(): void
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
                'service_time' => '17:00',
                'address' => 'House 10, Road 2',
                'area' => 'Dhanmondi',
                'city' => 'Dhaka',
            ])
            ->assertUnprocessable()
            ->assertJsonPath('message', 'The selected time is outside the butcher’s working hours.');

        $this->assertDatabaseCount('bookings', 0);
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

    public function test_butcher_confirmation_completes_cash_payment_after_customer_confirmation(): void
    {
        ['butcher' => $butcher, 'booking' => $booking, 'payment' => $payment] = $this->createPaymentScenario(
            paymentAttributes: ['payer_confirmed_at' => now()],
        );

        $this->actingAs($butcher)
            ->postJson("/api/butcher/payments/{$payment->id}/confirm")
            ->assertOk()
            ->assertJsonPath('payment.status', 'paid')
            ->assertJsonPath('booking.payment_status', 'Advance paid');

        $this->assertNotNull($payment->fresh()->receiver_confirmed_at);
        $this->assertNotNull($payment->fresh()->confirmed_at);
        $this->assertSame($butcher->id, $payment->fresh()->confirmed_by);
        $this->assertSame('Advance paid', $booking->fresh()->payment_status);
    }

    public function test_butcher_confirmation_waits_for_customer_confirmation(): void
    {
        ['butcher' => $butcher, 'booking' => $booking, 'payment' => $payment] = $this->createPaymentScenario();

        $this->actingAs($butcher)
            ->postJson("/api/butcher/payments/{$payment->id}/confirm")
            ->assertOk()
            ->assertJsonPath('payment.status', 'pending')
            ->assertJsonPath('booking.payment_status', 'Payment pending');

        $this->assertNotNull($payment->fresh()->receiver_confirmed_at);
        $this->assertNull($payment->fresh()->confirmed_at);
        $this->assertSame('Payment pending', $booking->fresh()->payment_status);
    }

    public function test_unauthenticated_user_cannot_confirm_butcher_payment(): void
    {
        ['payment' => $payment] = $this->createPaymentScenario();

        $this->postJson("/api/butcher/payments/{$payment->id}/confirm")
            ->assertUnauthorized();

        $this->assertNull($payment->fresh()->receiver_confirmed_at);
    }

    public function test_customer_cannot_use_butcher_payment_confirmation_endpoint(): void
    {
        ['customer' => $customer, 'payment' => $payment] = $this->createPaymentScenario();

        $this->actingAs($customer)
            ->postJson("/api/butcher/payments/{$payment->id}/confirm")
            ->assertForbidden();

        $this->assertNull($payment->fresh()->receiver_confirmed_at);
    }

    public function test_butcher_cannot_confirm_another_butchers_payment(): void
    {
        ['payment' => $payment] = $this->createPaymentScenario();
        $anotherButcher = User::factory()->create(['role' => 'butcher']);

        $this->actingAs($anotherButcher)
            ->postJson("/api/butcher/payments/{$payment->id}/confirm")
            ->assertNotFound();

        $this->assertNull($payment->fresh()->receiver_confirmed_at);
    }

    public function test_butcher_booking_endpoint_returns_only_owned_bookings_with_payment_records(): void
    {
        ['butcher' => $butcher, 'booking' => $booking, 'payment' => $payment] = $this->createPaymentScenario();
        $this->createPaymentScenario();

        $this->actingAs($butcher)
            ->getJson('/api/butcher/bookings?per_page=100')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $booking->id)
            ->assertJsonPath('data.0.payments.0.id', $payment->id)
            ->assertJsonPath('data.0.payments.0.status', 'pending');
    }

    public function test_butcher_cannot_confirm_a_missing_payment(): void
    {
        $butcher = User::factory()->create(['role' => 'butcher']);

        $this->actingAs($butcher)
            ->postJson('/api/butcher/payments/999999/confirm')
            ->assertNotFound();
    }

    public function test_butcher_cannot_confirm_a_paid_payment_again(): void
    {
        ['butcher' => $butcher, 'payment' => $payment] = $this->createPaymentScenario(
            paymentAttributes: ['status' => 'paid', 'payer_confirmed_at' => now(), 'receiver_confirmed_at' => now()],
        );

        $this->actingAs($butcher)
            ->postJson("/api/butcher/payments/{$payment->id}/confirm")
            ->assertStatus(409);
    }

    public function test_butcher_cannot_confirm_a_balance_payment_before_service_completion(): void
    {
        ['butcher' => $butcher, 'payment' => $payment] = $this->createPaymentScenario(
            paymentAttributes: ['purpose' => 'balance', 'amount' => 8000],
        );

        $this->actingAs($butcher)
            ->postJson("/api/butcher/payments/{$payment->id}/confirm")
            ->assertUnprocessable()
            ->assertJsonPath('message', 'The remaining balance is payable after service completion.');

        $this->assertNull($payment->fresh()->receiver_confirmed_at);
    }

    public function test_butcher_confirmation_completes_an_eligible_balance_payment(): void
    {
        ['butcher' => $butcher, 'booking' => $booking, 'payment' => $payment] = $this->createPaymentScenario(
            bookingAttributes: ['status' => 'Completed'],
            paymentAttributes: [
                'purpose' => 'balance',
                'amount' => 8000,
                'payer_confirmed_at' => now(),
            ],
        );

        $this->actingAs($butcher)
            ->postJson("/api/butcher/payments/{$payment->id}/confirm")
            ->assertOk()
            ->assertJsonPath('payment.status', 'paid')
            ->assertJsonPath('booking.payment_status', 'Paid in full')
            ->assertJsonPath('booking.remaining_amount', 0);

        $this->assertSame(0, $booking->fresh()->remaining_amount);
    }

    public function test_butcher_cannot_confirm_a_payment_for_a_cancelled_booking(): void
    {
        ['butcher' => $butcher, 'payment' => $payment] = $this->createPaymentScenario(
            bookingAttributes: ['status' => 'Cancelled'],
        );

        $this->actingAs($butcher)
            ->postJson("/api/butcher/payments/{$payment->id}/confirm")
            ->assertUnprocessable();

        $this->assertNull($payment->fresh()->receiver_confirmed_at);
    }

    public function test_butcher_cannot_confirm_an_online_payment(): void
    {
        ['butcher' => $butcher, 'payment' => $payment] = $this->createPaymentScenario(
            paymentAttributes: ['method' => 'bkash'],
        );

        $this->actingAs($butcher)
            ->postJson("/api/butcher/payments/{$payment->id}/confirm")
            ->assertUnprocessable();

        $this->assertNull($payment->fresh()->receiver_confirmed_at);
    }

    public function test_butcher_cannot_confirm_a_payment_twice(): void
    {
        ['butcher' => $butcher, 'payment' => $payment] = $this->createPaymentScenario(
            paymentAttributes: ['receiver_confirmed_at' => now()],
        );

        $this->actingAs($butcher)
            ->postJson("/api/butcher/payments/{$payment->id}/confirm")
            ->assertStatus(409);
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
            'reference' => 'QBX-TEST-'.Str::upper(Str::random(8)),
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
