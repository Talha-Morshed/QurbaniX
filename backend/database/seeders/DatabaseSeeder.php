<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /** Adnan: Keep fresh databases free of demo accounts and fake marketplace listings, while still creating the required platform admin account. */
    public function run(): void
    {
        $this->call(AdminSeeder::class);
    }
}
