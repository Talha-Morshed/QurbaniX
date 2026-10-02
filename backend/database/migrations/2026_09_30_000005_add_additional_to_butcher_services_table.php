<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('butcher_services', function (Blueprint $table) {
            $table->string('additional', 120)->default('৳0 delivery estimate');
        });
    }

    public function down(): void
    {
        Schema::table('butcher_services', function (Blueprint $table) {
            $table->dropColumn('additional');
        });
    }
};
