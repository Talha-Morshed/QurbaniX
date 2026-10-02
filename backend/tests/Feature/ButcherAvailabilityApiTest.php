<?php

namespace Tests\Feature;

use App\Models\AvailabilityException;
use App\Models\AvailabilitySchedule;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ButcherAvailabilityApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_butcher_can_load_and_update_their_weekly_availability_and_exceptions(): void
    {
        $butcher = User::factory()->create(['role' => 'butcher']);
        $butcher->butcherProfile()->create([
            'area' => 'Dhanmondi',
            'city' => 'Dhaka',
            'is_available' => true,
            'daily_capacity' => 5,
        ]);
        $otherButcher = User::factory()->create(['role' => 'butcher']);
        $otherButcher->butcherProfile()->create([
            'area' => 'Gulshan',
            'city' => 'Dhaka',
        ]);
        AvailabilitySchedule::create([
            'butcher_id' => $butcher->id,
            'weekday' => 6,
            'is_enabled' => true,
            'starts_at' => '09:00',
            'ends_at' => '17:00',
            'capacity' => 5,
        ]);
        AvailabilitySchedule::create([
            'butcher_id' => $otherButcher->id,
            'weekday' => 6,
            'is_enabled' => false,
            'starts_at' => null,
            'ends_at' => null,
            'capacity' => 2,
        ]);
        DB::table('availability_exceptions')->insert([
            'butcher_id' => $butcher->id,
            'date' => '2026-12-25',
            'is_available' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('availability_exceptions')->insert([
            'butcher_id' => $otherButcher->id,
            'date' => '2026-12-26',
            'is_available' => true,
            'starts_at' => '10:00',
            'ends_at' => '14:00',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->actingAs($butcher)
            ->getJson('/api/butcher/availability')
            ->assertOk()
            ->assertJsonPath('is_available', true)
            ->assertJsonPath('daily_capacity', 5)
            ->assertJsonCount(1, 'schedule')
            ->assertJsonPath('schedule.0.weekday', 6)
            ->assertJsonCount(1, 'exceptions')
            ->assertJsonPath('exceptions.0.is_available', false);

        $schedule = [];
        for ($weekday = 0; $weekday < 7; $weekday++) {
            $schedule[] = [
                'weekday' => $weekday,
                'is_enabled' => $weekday === 6,
                'starts_at' => $weekday === 6 ? '10:15' : null,
                'ends_at' => $weekday === 6 ? '18:30' : null,
                'capacity' => 8,
            ];
        }

        $response = $this->putJson('/api/butcher/availability', [
            'is_available' => false,
            'daily_capacity' => 8,
            'schedule' => $schedule,
            'exceptions' => [[
                'date' => '2026-12-25',
                'is_available' => true,
                'starts_at' => '11:00',
                'ends_at' => '15:30',
                'capacity' => 3,
            ]],
        ])
            ->assertOk()
            ->assertJsonPath('is_available', false)
            ->assertJsonPath('daily_capacity', 8)
            ->assertJsonCount(7, 'schedule')
            ->assertJsonPath('schedule.0.starts_at', null)
            ->assertJsonPath('schedule.0.ends_at', null)
            ->assertJsonCount(1, 'exceptions')
            ->assertJsonPath('exceptions.0.is_available', true);
        $this->assertStringStartsWith('10:15', $response->json('schedule.6.starts_at'));
        $this->assertStringStartsWith('18:30', $response->json('schedule.6.ends_at'));
        $this->assertStringStartsWith('11:00', $response->json('exceptions.0.starts_at'));

        $this->assertDatabaseHas('butcher_profiles', [
            'user_id' => $butcher->id,
            'is_available' => false,
            'daily_capacity' => 8,
        ]);
        $this->assertDatabaseHas('availability_schedules', [
            'butcher_id' => $butcher->id,
            'weekday' => 6,
            'capacity' => 8,
        ]);
        $this->assertDatabaseHas('availability_schedules', [
            'butcher_id' => $butcher->id,
            'weekday' => 0,
            'is_enabled' => false,
            'starts_at' => null,
            'ends_at' => null,
        ]);
        $this->assertDatabaseHas('availability_exceptions', [
            'butcher_id' => $butcher->id,
            'date' => '2026-12-25',
            'is_available' => true,
        ]);
        $this->assertDatabaseHas('availability_schedules', [
            'butcher_id' => $otherButcher->id,
            'weekday' => 6,
            'capacity' => 2,
        ]);
        $this->assertDatabaseHas('availability_exceptions', [
            'butcher_id' => $otherButcher->id,
            'date' => '2026-12-26',
            'is_available' => true,
        ]);
    }

    public function test_availability_requires_an_authenticated_butcher(): void
    {
        $payload = [
            'is_available' => true,
            'daily_capacity' => 5,
            'schedule' => [],
        ];
        $this->getJson('/api/butcher/availability')->assertUnauthorized();
        $this->putJson('/api/butcher/availability', $payload)->assertUnauthorized();

        $customer = User::factory()->create(['role' => 'customer']);
        $this->actingAs($customer)
            ->getJson('/api/butcher/availability')
            ->assertForbidden();
        $this->putJson('/api/butcher/availability', $payload)->assertForbidden();
    }

    public function test_availability_rejects_invalid_capacity_and_time_ranges(): void
    {
        $butcher = User::factory()->create(['role' => 'butcher']);
        $schedule = [];
        for ($weekday = 0; $weekday < 7; $weekday++) {
            $schedule[] = [
                'weekday' => $weekday,
                'is_enabled' => true,
                'starts_at' => $weekday === 0 ? '18:00' : '09:00',
                'ends_at' => $weekday === 0 ? '10:00' : '17:00',
                'capacity' => 5,
            ];
        }

        $this->actingAs($butcher)
            ->putJson('/api/butcher/availability', [
                'is_available' => true,
                'daily_capacity' => 101,
                'schedule' => $schedule,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['daily_capacity', 'schedule.0.ends_at']);
    }
}
