<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $phone = env('ADMIN_PHONE', '01000000000');
        $email = env('ADMIN_EMAIL', 'admin@qurbanix.test');
        $password = env('ADMIN_PASSWORD', 'Admin@123');

        $existingUser = User::query()->where('phone', $phone)->first();

        if ($existingUser) {
            if ($existingUser->role !== 'admin') {
                throw new RuntimeException('The configured admin phone number belongs to a non-admin account.');
            }

            return;
        }

        User::query()->create([
            'name' => 'System Administrator',
            'phone' => $phone,
            'email' => $email,
            'role' => 'admin',
            'password' => Hash::make($password),
        ]);
    }
}
