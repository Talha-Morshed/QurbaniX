<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\ButcherController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\LoginController;
use App\Http\Controllers\Api\PaymentController;
use Illuminate\Support\Facades\Route;

/*
 * Adnan Bin Aman: Connects public auth/directory URLs and protected customer, butcher, and admin URLs
 * to their controllers. The role middleware keeps each private API area restricted to its role.
 */
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
Route::post('/login', [LoginController::class, 'requestPin'])->middleware('throttle:5,1');
Route::post('/login/verify', [LoginController::class, 'verifyPin'])->middleware('throttle:10,1');

Route::get('/butchers', [ButcherController::class, 'index']);
Route::get('/butchers/{butcher}', [ButcherController::class, 'show']);

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/payments', [PaymentController::class, 'index']);

    Route::middleware('role:customer')->prefix('customer')->group(function (): void {
        Route::get('/profile', [CustomerController::class, 'profile']);
        Route::put('/profile', [CustomerController::class, 'updateProfile']);
        Route::post('/addresses', [CustomerController::class, 'createAddress']);
        Route::put('/addresses/{address}', [CustomerController::class, 'updateAddress']);
        Route::delete('/addresses/{address}', [CustomerController::class, 'deleteAddress']);
        Route::get('/bookings', [BookingController::class, 'customerIndex']);
        Route::post('/bookings', [BookingController::class, 'store']);
        Route::get('/bookings/{booking}', [BookingController::class, 'show']);
        Route::patch('/bookings/{booking}/status', [BookingController::class, 'updateStatus']);
        Route::post('/bookings/{booking}/payments', [PaymentController::class, 'store']);
        Route::post('/bookings/{booking}/reviews', [CustomerController::class, 'createReview']);
        Route::get('/reviews', [CustomerController::class, 'reviews']);
        Route::get('/notifications', [CustomerController::class, 'notifications']);
        Route::patch('/notifications/read-all', [CustomerController::class, 'markAllNotificationsRead']);
        Route::patch('/notifications/{notificationId}/read', [CustomerController::class, 'markNotificationRead']);
    });

    Route::middleware('role:butcher')->prefix('butcher')->group(function (): void {
        Route::get('/profile', [ButcherController::class, 'profile']);
        Route::put('/profile', [ButcherController::class, 'updateProfile']);
        Route::get('/services', [ButcherController::class, 'services']);
        Route::post('/services', [ButcherController::class, 'createService']);
        Route::put('/services/{service}', [ButcherController::class, 'updateService']);
        Route::delete('/services/{service}', [ButcherController::class, 'deleteService']);
        Route::get('/availability', [ButcherController::class, 'availability']);
        Route::put('/availability', [ButcherController::class, 'updateAvailability']);
        Route::get('/bookings', [BookingController::class, 'butcherIndex']);
        Route::get('/bookings/{booking}', [BookingController::class, 'show']);
        Route::patch('/bookings/{booking}/status', [BookingController::class, 'updateStatus']);
        Route::post('/payments/{payment}/confirm', [PaymentController::class, 'confirm']);
        Route::get('/reviews', [CustomerController::class, 'butcherReviews']);
    });

    Route::middleware('role:admin')->prefix('admin')->group(function (): void {
        Route::get('/users', [CustomerController::class, 'adminUsers']);
        Route::get('/bookings', [CustomerController::class, 'adminBookings']);
        Route::patch('/butchers/{butcher}/verification', [CustomerController::class, 'verifyButcher']);
    });
});
