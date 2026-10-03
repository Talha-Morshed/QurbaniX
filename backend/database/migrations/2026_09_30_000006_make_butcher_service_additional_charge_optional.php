<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('butcher_services', function (Blueprint $table) {
            $table->string('additional', 120)->nullable()->default(null)->change();
        });

        DB::table('butcher_services')
            ->where('additional', '৳0 delivery estimate')
            ->update(['additional' => null]);
    }

    public function down(): void
    {
        DB::table('butcher_services')
            ->whereNull('additional')
            ->update(['additional' => '৳0 delivery estimate']);

        Schema::table('butcher_services', function (Blueprint $table) {
            $table->string('additional', 120)->nullable(false)->default('৳0 delivery estimate')->change();
        });
    }
};
