<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ButcherProfileApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_butcher_can_load_and_update_only_their_profile(): void
    {
        $butcher = User::factory()->create([
            'role' => 'butcher',
            'name' => 'Original Butcher',
            'email' => null,
        ]);
        $butcher->butcherProfile()->create([
            'area' => 'Dhanmondi',
            'city' => 'Dhaka',
            'verification_status' => 'pending',
        ]);
        $anotherButcher = User::factory()->create(['role' => 'butcher']);
        $anotherButcher->butcherProfile()->create([
            'area' => 'Gulshan',
            'city' => 'Dhaka',
        ]);

        $this->actingAs($butcher)
            ->getJson('/api/butcher/profile')
            ->assertOk()
            ->assertJsonPath('profile.user.id', $butcher->id)
            ->assertJsonPath('profile.user.name', 'Original Butcher')
            ->assertJsonPath('profile.area', 'Dhanmondi')
            ->assertJsonPath('profile.verification_status', 'pending');

        $this->putJson('/api/butcher/profile', [
            'name' => 'Updated Butcher',
            'email' => 'updated@example.test',
            'bio' => 'Careful, dependable service.',
            'area' => 'Mirpur',
            'city' => 'Dhaka',
            'service_areas' => ['Mirpur', 'Uttara'],
            'specializations' => ['Cow Qurbani'],
            'role' => 'admin',
            'verification_status' => 'verified',
            'verified_at' => now()->toISOString(),
        ])
            ->assertOk()
            ->assertJsonPath('profile.area', 'Mirpur')
            ->assertJsonPath('profile.verification_status', 'pending');

        $this->actingAs($butcher->fresh())
            ->getJson('/api/butcher/profile')
            ->assertOk()
            ->assertJsonPath('profile.user.name', 'Updated Butcher')
            ->assertJsonPath('profile.user.email', 'updated@example.test')
            ->assertJsonPath('profile.area', 'Mirpur')
            ->assertJsonPath('profile.service_areas', ['Mirpur', 'Uttara'])
            ->assertJsonPath('profile.specializations', ['Cow Qurbani'])
            ->assertJsonPath('profile.verification_status', 'pending');

        $this->assertDatabaseHas('users', [
            'id' => $butcher->id,
            'name' => 'Updated Butcher',
            'email' => 'updated@example.test',
            'role' => 'butcher',
        ]);
        $this->assertDatabaseHas('butcher_profiles', [
            'user_id' => $butcher->id,
            'area' => 'Mirpur',
            'city' => 'Dhaka',
            'verification_status' => 'pending',
            'bio' => 'Careful, dependable service.',
        ]);
        $this->assertDatabaseHas('butcher_profiles', [
            'user_id' => $anotherButcher->id,
            'area' => 'Gulshan',
        ]);
    }

    public function test_profile_endpoints_require_an_authenticated_butcher(): void
    {
        $this->getJson('/api/butcher/profile')->assertUnauthorized();
        $this->putJson('/api/butcher/profile', ['name' => 'Not allowed'])->assertUnauthorized();

        $customer = User::factory()->create(['role' => 'customer']);
        $this->actingAs($customer)
            ->getJson('/api/butcher/profile')
            ->assertForbidden();
        $this->putJson('/api/butcher/profile', ['name' => 'Not allowed'])
            ->assertForbidden();
    }

    public function test_profile_update_returns_backend_validation_errors(): void
    {
        $butcher = User::factory()->create(['role' => 'butcher']);

        $this->actingAs($butcher)
            ->putJson('/api/butcher/profile', [
                'email' => 'not-an-email',
                'area' => '',
                'city' => '',
                'service_areas' => 'not-an-array',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email', 'area', 'city', 'service_areas']);
    }
}
