<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Adnan Bin Aman: Registers customer/butcher accounts and serves basic signed-in account actions.
 */
class AuthController extends Controller
{
    /** Adnan: Save the account and its initial butcher profile together, then return a login token. */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'regex:/^01\d{9}$/', 'unique:users'],
            'email' => ['nullable', 'email', 'max:255', 'unique:users'],
            'role' => ['required', 'string', 'in:customer,butcher'],
            'area' => ['nullable', 'string', 'max:120'],
            'city' => ['nullable', 'string', 'max:120'],
        ]);

        $user = DB::transaction(function () use ($validated): User {
            $user = User::create([
                'name' => $validated['name'],
                'phone' => $validated['phone'],
                'email' => $validated['email'] ?? null,
                'role' => $validated['role'],
            ]);

            if ($user->role === 'butcher') {
                $user->butcherProfile()->create([
                    'area' => $validated['area'] ?? null,
                    'city' => $validated['city'] ?? 'Dhaka',
                ]);
            }

            return $user;
        });

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'User registered successfully.',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    /** Adnan: Return only the signed-in user's profile and saved addresses. */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load(['butcherProfile', 'customerAddresses']);

        return response()->json(['user' => $user]);
    }

    /** Adnan: Revoke the current token so it can no longer access protected APIs. */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }
}
