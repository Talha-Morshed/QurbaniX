<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $phone = env('ADMIN_PHONE', '01000000000');
        $email = env('ADMIN_EMAIL', 'admin@qurbanix.test');
        $password = env('ADMIN_PASSWORD', 'Admin@123');

        User::query()->updateOrCreate(
            ['phone' => $phone],
            [
                'name' => 'System Administrator',
                'email' => $email,
                'role' => 'admin',
                'password' => Hash::make($password),
            ]
        );
    }
}
