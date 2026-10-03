<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\AdminSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_seeder_creates_the_configured_admin_without_resetting_existing_admins(): void
    {
        $phone = env('ADMIN_PHONE', '01000000000');
        $seeder = new AdminSeeder;

        $seeder->run();

        $admin = User::query()->where('phone', $phone)->firstOrFail();
        $this->assertSame('admin', $admin->role);
        $passwordHash = $admin->password;

        $seeder->run();

        $this->assertSame(1, User::query()->where('phone', $phone)->count());
        $this->assertSame($passwordHash, $admin->fresh()->password);
    }

    public function test_admin_seeder_refuses_to_promote_an_existing_non_admin_account(): void
    {
        $phone = env('ADMIN_PHONE', '01000000000');
        User::factory()->create(['phone' => $phone, 'role' => 'customer']);

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('The configured admin phone number belongs to a non-admin account.');

        (new AdminSeeder)->run();
    }
}
