<?php

namespace Tests\Feature;

use App\Models\ButcherService;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ButcherServicesApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_butcher_can_list_create_update_and_delete_their_services(): void
    {
        $butcher = User::factory()->create(['role' => 'butcher']);

        $this->actingAs($butcher)
            ->getJson('/api/butcher/services')
            ->assertOk()
            ->assertJsonPath('services', []);

        $createResponse = $this->actingAs($butcher)
            ->postJson('/api/butcher/services', [
                'name' => 'Goat Qurbani',
                'animal' => 'Goat',
                'category' => 'Slaughter & cutting',
                'description' => 'Careful cutting and packaging.',
                'price' => 4800,
                'duration' => '1–2 hours',
                'additional' => '৳300 delivery estimate',
                'is_available' => true,
            ])
            ->assertCreated()
            ->assertJsonPath('service.butcher_id', $butcher->id)
            ->assertJsonPath('service.price', 4800)
            ->assertJsonPath('service.additional', '৳300 delivery estimate');

        $serviceId = $createResponse->json('service.id');
        $this->assertDatabaseHas('butcher_services', [
            'id' => $serviceId,
            'butcher_id' => $butcher->id,
            'additional' => '৳300 delivery estimate',
        ]);

        $this->getJson('/api/butcher/services')
            ->assertOk()
            ->assertJsonPath('services.0.id', $serviceId);

        $this->putJson("/api/butcher/services/{$serviceId}", [
            'name' => 'Premium Goat Qurbani',
            'price' => 5200,
            'additional' => '৳400 delivery estimate',
            'is_available' => false,
        ])
            ->assertOk()
            ->assertJsonPath('service.name', 'Premium Goat Qurbani')
            ->assertJsonPath('service.price', 5200)
            ->assertJsonPath('service.additional', '৳400 delivery estimate')
            ->assertJsonPath('service.is_available', false);

        $this->assertDatabaseHas('butcher_services', [
            'id' => $serviceId,
            'name' => 'Premium Goat Qurbani',
            'price' => 5200,
            'additional' => '৳400 delivery estimate',
            'is_available' => false,
        ]);

        $this->deleteJson("/api/butcher/services/{$serviceId}")
            ->assertOk();
        $this->assertDatabaseMissing('butcher_services', ['id' => $serviceId]);
    }

    public function test_service_management_requires_a_butcher_and_enforces_service_ownership(): void
    {
        $this->getJson('/api/butcher/services')->assertUnauthorized();

        $customer = User::factory()->create(['role' => 'customer']);
        $this->actingAs($customer)->getJson('/api/butcher/services')->assertForbidden();

        $owner = User::factory()->create(['role' => 'butcher']);
        $otherButcher = User::factory()->create(['role' => 'butcher']);
        $service = ButcherService::create([
            'butcher_id' => $owner->id,
            'name' => 'Cow Qurbani',
            'animal' => 'Cow',
            'category' => 'Slaughter & cutting',
            'price' => 8500,
        ]);

        $this->actingAs($otherButcher)
            ->putJson("/api/butcher/services/{$service->id}", ['name' => 'Hijacked service'])
            ->assertNotFound();
        $this->deleteJson("/api/butcher/services/{$service->id}")
            ->assertNotFound();

        $this->assertDatabaseHas('butcher_services', [
            'id' => $service->id,
            'butcher_id' => $owner->id,
            'name' => 'Cow Qurbani',
        ]);
    }

    public function test_an_unspecified_additional_charge_is_not_filled_with_a_placeholder(): void
    {
        $butcher = User::factory()->create(['role' => 'butcher']);

        $response = $this->actingAs($butcher)
            ->postJson('/api/butcher/services', [
                'name' => 'Goat Qurbani',
                'animal' => 'Goat',
                'category' => 'Slaughter & cutting',
                'description' => 'Careful cutting and packaging.',
                'price' => 4800,
                'is_available' => true,
            ])
            ->assertCreated()
            ->assertJsonPath('service.additional', null);

        $this->assertDatabaseHas('butcher_services', [
            'id' => $response->json('service.id'),
            'additional' => null,
        ]);
    }
}
