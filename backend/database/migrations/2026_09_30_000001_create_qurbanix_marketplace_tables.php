<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Adnan Bin Aman: Creates the persistent marketplace tables used by the Laravel APIs. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('butcher_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->text('bio')->nullable();
            $table->string('area')->nullable();
            $table->string('city')->default('Dhaka');
            $table->json('service_areas')->nullable();
            $table->json('specializations')->nullable();
            $table->string('verification_status')->default('pending');
            $table->timestamp('verified_at')->nullable();
            $table->boolean('is_available')->default(true);
            $table->unsignedSmallInteger('daily_capacity')->default(5);
            $table->timestamps();
            $table->index(['verification_status', 'is_available']);
            $table->index(['city', 'area']);
        });

        Schema::create('butcher_services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('butcher_id')->constrained('users')->cascadeOnDelete();
            $table->string('name');
            $table->string('animal');
            $table->string('category')->default('Slaughter & cutting');
            $table->text('description')->nullable();
            $table->unsignedInteger('price');
            $table->string('duration')->nullable();
            $table->boolean('is_available')->default(true);
            $table->timestamps();
            $table->index(['butcher_id', 'is_available']);
        });

        Schema::create('customer_addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('label')->default('Home');
            $table->string('address');
            $table->string('area');
            $table->string('city');
            $table->text('instructions')->nullable();
            $table->boolean('is_default')->default(false);
            $table->timestamps();
            $table->index(['user_id', 'is_default']);
        });

        Schema::create('availability_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('butcher_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedTinyInteger('weekday');
            $table->boolean('is_enabled')->default(true);
            $table->time('starts_at')->nullable();
            $table->time('ends_at')->nullable();
            $table->unsignedSmallInteger('capacity')->default(5);
            $table->timestamps();
            $table->unique(['butcher_id', 'weekday']);
        });

        Schema::create('availability_exceptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('butcher_id')->constrained('users')->cascadeOnDelete();
            $table->date('date');
            $table->boolean('is_available')->default(false);
            $table->time('starts_at')->nullable();
            $table->time('ends_at')->nullable();
            $table->unsignedSmallInteger('capacity')->nullable();
            $table->timestamps();
            $table->unique(['butcher_id', 'date']);
        });

        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('customer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('butcher_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('service_id')->constrained('butcher_services')->restrictOnDelete();
            $table->date('service_date');
            $table->time('service_time');
            $table->string('address');
            $table->string('area');
            $table->string('city');
            $table->text('instructions')->nullable();
            $table->unsignedInteger('total_amount');
            $table->unsignedInteger('advance_amount');
            $table->unsignedInteger('remaining_amount');
            $table->string('status')->default('Pending');
            $table->string('payment_status')->default('Unpaid');
            $table->text('cancellation_reason')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->index(['customer_id', 'service_date']);
            $table->index(['butcher_id', 'service_date', 'status']);
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->foreignId('payer_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedInteger('amount');
            $table->string('purpose')->default('advance');
            $table->string('method');
            $table->string('status')->default('pending');
            $table->string('provider_reference')->nullable()->unique();
            $table->foreignId('confirmed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamps();
            $table->index(['booking_id', 'status']);
        });

        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->unique()->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('butcher_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedTinyInteger('rating');
            $table->unsignedTinyInteger('service_rating')->nullable();
            $table->unsignedTinyInteger('professionalism_rating')->nullable();
            $table->unsignedTinyInteger('punctuality_rating')->nullable();
            $table->unsignedTinyInteger('cleanliness_rating')->nullable();
            $table->text('comment');
            $table->string('recommendation')->nullable();
            $table->string('status')->default('published');
            $table->timestamps();
            $table->index(['butcher_id', 'status']);
        });

        Schema::create('user_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('booking_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type');
            $table->string('title');
            $table->text('message');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'read_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_notifications');
        Schema::dropIfExists('reviews');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('bookings');
        Schema::dropIfExists('availability_exceptions');
        Schema::dropIfExists('availability_schedules');
        Schema::dropIfExists('customer_addresses');
        Schema::dropIfExists('butcher_services');
        Schema::dropIfExists('butcher_profiles');
    }
};
