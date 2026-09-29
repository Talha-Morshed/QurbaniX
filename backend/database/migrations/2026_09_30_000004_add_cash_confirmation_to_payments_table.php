<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Adnan Bin Aman: Stores separate customer and butcher confirmations for cash payments. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->timestamp('payer_confirmed_at')->nullable()->after('confirmed_at');
            $table->timestamp('receiver_confirmed_at')->nullable()->after('payer_confirmed_at');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['payer_confirmed_at', 'receiver_confirmed_at']);
        });
    }
};
