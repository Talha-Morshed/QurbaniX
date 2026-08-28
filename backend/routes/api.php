<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\LoginController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);

Route::post('/login', [LoginController::class, 'requestPin']);
Route::post('/login/verify', [LoginController::class, 'verifyPin']);
