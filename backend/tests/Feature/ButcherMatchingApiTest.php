<?php

namespace Tests\Feature;

use App\Models\AvailabilityException;
use App\Models\Booking;
use App\Models\Review;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class ButcherMatchingApiTest extends TestCase
{
    use RefreshDatabase;

    private const DATE = '2026-11-15';

    public function test_only_verified_butchers_are_returned(): void
    {
        $verified = $this->createButcher();
        $this->createButcher('pending');
        $this->createButcher('rejected');

        $this->actingAs(User::factory()->create(['role' => 'customer']))
            ->postJson('/api/customer/butcher-matches', $this->payload())
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.butcher.id', $verified->id);
    }

    public function test_animal_and_service_category_matching_are_reflected_in_the_score(): void
    {
        $goatServiceButcher = $this->createButcher(
            service: ['animal' => 'Goat', 'category' => 'full_service'],
        );
        $cowServiceButcher = $this->createButcher(
            service: ['animal' => 'Cow', 'category' => 'full_service'],
        );

        $response = $this->match([
            'animal_type' => 'goat',
            'service_category' => 'full_service',
        ])->assertOk();

        $this->assertSame($goatServiceButcher->id, $response->json('data.0.butcher.id'));
        $this->assertSame(65, $response->json('data.0.match_score'));
        $this->assertSame('Goat', $response->json('data.0.service.animal'));
        $this->assertContains('Supports your selected animal', $response->json('data.0.match_reasons'));
        $this->assertSame($cowServiceButcher->id, $response->json('data.1.butcher.id'));
        $this->assertContains('Does not support your selected animal', $response->json('data.1.match_reasons'));
    }

    public function test_area_matching_contributes_to_the_match_score(): void
    {
        $areaMatch = $this->createButcher(profile: ['area' => 'Dhanmondi']);
        $this->createButcher(profile: ['area' => 'Gulshan']);

        $response = $this->match(['area' => 'dhanmondi'])->assertOk();

        $this->assertSame($areaMatch->id, $response->json('data.0.butcher.id'));
        $this->assertSame(70, $response->json('data.0.match_score'));
        $this->assertContains('Serves your selected area', $response->json('data.0.match_reasons'));
    }

    public function test_city_matching_contributes_to_the_match_score(): void
    {
        $cityMatch = $this->createButcher(profile: ['city' => 'Dhaka']);
        $this->createButcher(profile: ['city' => 'Chattogram']);

        $response = $this->match(['city' => 'dhaka'])->assertOk();

        $this->assertSame($cityMatch->id, $response->json('data.0.butcher.id'));
        $this->assertSame(65, $response->json('data.0.match_score'));
        $this->assertContains('Matches your selected city', $response->json('data.0.match_reasons'));
    }

    public function test_budget_matching_uses_the_selected_service_price(): void
    {
        $withinBudget = $this->createButcher(service: ['price' => 5000]);
        $overBudget = $this->createButcher(service: ['price' => 7000]);

        $response = $this->match(['max_budget' => 6000])->assertOk();

        $this->assertSame($withinBudget->id, $response->json('data.0.butcher.id'));
        $this->assertSame(65, $response->json('data.0.match_score'));
        $this->assertContains('Within your maximum budget', $response->json('data.0.match_reasons'));
        $this->assertSame($overBudget->id, $response->json('data.1.butcher.id'));
        $this->assertContains('Exceeds your maximum budget', $response->json('data.1.match_reasons'));
    }

    public function test_minimum_rating_awards_points_and_keeps_closest_lower_rated_matches(): void
    {
        $highRated = $this->createButcher();
        $lowRated = $this->createButcher();
        $this->addReview($highRated, 5);
        $this->addReview($lowRated, 3);

        $response = $this->match(['min_rating' => 4])->assertOk();

        $this->assertSame($highRated->id, $response->json('data.0.butcher.id'));
        $this->assertSame(65, $response->json('data.0.match_score'));
        $this->assertSame($lowRated->id, $response->json('data.1.butcher.id'));
        $this->assertSame(55, $response->json('data.1.match_score'));
        $this->assertContains('Does not meet your minimum rating', $response->json('data.1.match_reasons'));
    }

    public function test_date_exceptions_override_the_weekly_schedule(): void
    {
        $available = $this->createButcher();
        $unavailable = $this->createButcher();
        $weeklyUnavailable = $this->createButcher();
        $weeklyUnavailable->availabilitySchedules()->update(['is_enabled' => false]);
        AvailabilityException::create([
            'butcher_id' => $unavailable->id,
            'date' => self::DATE,
            'is_available' => false,
        ]);

        $response = $this->match()->assertOk();

        $this->assertSame($available->id, $response->json('data.0.butcher.id'));
        $this->assertTrue($response->json('data.0.availability.is_available'));
        $this->assertSame($unavailable->id, $response->json('data.1.butcher.id'));
        $this->assertFalse($response->json('data.1.availability.is_available'));
        $this->assertContains('Unavailable on your selected date', $response->json('data.1.availability.reasons'));
        $byId = collect($response->json('data'))->keyBy('butcher.id');
        $this->assertFalse($byId[$weeklyUnavailable->id]['availability']['is_available']);
        $this->assertContains(
            'No working hours are set for your selected date',
            $byId[$weeklyUnavailable->id]['availability']['reasons'],
        );
    }

    public function test_requested_time_must_be_within_the_working_hours(): void
    {
        $insideHours = $this->createButcher();
        $outsideHours = $this->createButcher();
        $outsideHours->availabilitySchedules()->update(['ends_at' => '12:00']);

        $response = $this->match(['time' => '14:00'])->assertOk();

        $this->assertSame($insideHours->id, $response->json('data.0.butcher.id'));
        $this->assertTrue($response->json('data.0.availability.time_available'));
        $this->assertSame($outsideHours->id, $response->json('data.1.butcher.id'));
        $this->assertTrue($response->json('data.1.availability.date_available'));
        $this->assertFalse($response->json('data.1.availability.time_available'));
        $this->assertFalse($response->json('data.1.availability.is_available'));
    }

    public function test_unavailable_profile_and_full_capacity_are_never_reported_available(): void
    {
        $profileUnavailable = $this->createButcher(profile: ['is_available' => false]);
        $capacityFull = $this->createButcher(schedule: ['capacity' => 1]);
        $this->addActiveBooking($capacityFull);

        $response = $this->match()->assertOk();
        $byId = collect($response->json('data'))->keyBy('butcher.id');

        $this->assertFalse($byId[$profileUnavailable->id]['availability']['is_available']);
        $this->assertFalse($byId[$capacityFull->id]['availability']['is_available']);
        $this->assertSame(0, $byId[$capacityFull->id]['availability']['remaining_capacity']);
        $this->assertContains(
            'Booking capacity is full on your selected date',
            $byId[$capacityFull->id]['availability']['reasons'],
        );
    }

    public function test_results_are_ordered_by_match_score_then_rating_and_price(): void
    {
        $strongMatch = $this->createButcher(
            profile: ['area' => 'Dhanmondi', 'city' => 'Dhaka'],
            service: ['price' => 5000],
        );
        $weakerMatch = $this->createButcher(
            profile: ['area' => 'Gulshan', 'city' => 'Chattogram'],
            service: ['price' => 7000],
        );
        $this->addReview($strongMatch, 5);

        $response = $this->match([
            'area' => 'Dhanmondi',
            'city' => 'Dhaka',
            'max_budget' => 6000,
            'min_rating' => 4,
        ])->assertOk();

        $results = $response->json('data');
        $this->assertSame($strongMatch->id, $results[0]['butcher']['id']);
        $this->assertSame($weakerMatch->id, $results[1]['butcher']['id']);
        $this->assertGreaterThan($results[1]['match_score'], $results[0]['match_score']);
    }

    public function test_equal_scores_are_ordered_by_rating_then_service_price(): void
    {
        $expensiveHighRated = $this->createButcher(service: ['price' => 6000]);
        $cheapHighRated = $this->createButcher(service: ['price' => 4500]);
        $lowerRated = $this->createButcher(service: ['price' => 3000]);
        $this->addReview($expensiveHighRated, 5);
        $this->addReview($cheapHighRated, 5);
        $this->addReview($lowerRated, 3);

        $response = $this->match()->assertOk();

        $this->assertSame($cheapHighRated->id, $response->json('data.0.butcher.id'));
        $this->assertSame($expensiveHighRated->id, $response->json('data.1.butcher.id'));
        $this->assertSame($lowerRated->id, $response->json('data.2.butcher.id'));
        $this->assertSame(
            $response->json('data.0.match_score'),
            $response->json('data.2.match_score'),
        );
    }

    public function test_invalid_match_preferences_are_rejected(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'customer']))
            ->postJson('/api/customer/butcher-matches', [
                'animal_type' => 'dog',
                'date' => '2020-01-01',
                'time' => '25:00',
                'max_budget' => -1,
                'min_rating' => 6,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['animal_type', 'date', 'time', 'max_budget', 'min_rating']);
    }

    public function test_matching_requires_an_authenticated_customer(): void
    {
        $this->postJson('/api/customer/butcher-matches', $this->payload())->assertUnauthorized();

        $butcher = User::factory()->create(['role' => 'butcher']);
        $this->actingAs($butcher)
            ->postJson('/api/customer/butcher-matches', $this->payload())
            ->assertForbidden();
    }

    private function match(array $overrides = [])
    {
        return $this->actingAs(User::factory()->create(['role' => 'customer']))
            ->postJson('/api/customer/butcher-matches', $this->payload($overrides));
    }

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'animal_type' => 'goat',
            'date' => self::DATE,
        ], $overrides);
    }

    private function createButcher(
        string $verification = 'verified',
        array $profile = [],
        array $service = [],
        ?array $schedule = null,
    ): User {
        $butcher = User::factory()->create(['role' => 'butcher']);
        $butcher->butcherProfile()->create(array_merge([
            'area' => 'Dhanmondi',
            'city' => 'Dhaka',
            'verification_status' => $verification,
            'is_available' => true,
            'daily_capacity' => 5,
        ], $profile));
        $butcher->services()->create(array_merge([
            'name' => 'Goat Qurbani',
            'animal' => 'Goat',
            'category' => 'full_service',
            'price' => 5000,
            'is_available' => true,
        ], $service));

        $weekday = Carbon::parse(self::DATE)->dayOfWeek;
        $butcher->availabilitySchedules()->create(array_merge([
            'weekday' => $weekday,
            'is_enabled' => true,
            'starts_at' => '09:00',
            'ends_at' => '17:00',
            'capacity' => 5,
        ], $schedule ?? []));

        return $butcher;
    }

    private function addActiveBooking(User $butcher): void
    {
        $customer = User::factory()->create(['role' => 'customer']);
        $service = $butcher->services()->firstOrFail();
        Booking::create([
            'reference' => 'QBX-'.Str::upper(Str::random(8)),
            'customer_id' => $customer->id,
            'butcher_id' => $butcher->id,
            'service_id' => $service->id,
            'service_date' => self::DATE,
            'service_time' => '10:00',
            'address' => 'Test address',
            'area' => 'Dhanmondi',
            'city' => 'Dhaka',
            'total_amount' => $service->price,
            'advance_amount' => 1000,
            'remaining_amount' => $service->price - 1000,
            'status' => 'Pending',
            'payment_status' => 'Unpaid',
        ]);
    }

    private function addReview(User $butcher, int $rating): void
    {
        $customer = User::factory()->create(['role' => 'customer']);
        $service = $butcher->services()->firstOrFail();
        $booking = Booking::create([
            'reference' => 'QBX-'.Str::upper(Str::random(8)),
            'customer_id' => $customer->id,
            'butcher_id' => $butcher->id,
            'service_id' => $service->id,
            'service_date' => self::DATE,
            'service_time' => '10:00',
            'address' => 'Test address',
            'area' => 'Dhanmondi',
            'city' => 'Dhaka',
            'total_amount' => $service->price,
            'advance_amount' => 1000,
            'remaining_amount' => $service->price - 1000,
            'status' => 'Completed',
            'payment_status' => 'Unpaid',
        ]);

        Review::create([
            'booking_id' => $booking->id,
            'customer_id' => $customer->id,
            'butcher_id' => $butcher->id,
            'rating' => $rating,
            'comment' => 'A helpful review.',
            'status' => 'published',
        ]);
    }
}
