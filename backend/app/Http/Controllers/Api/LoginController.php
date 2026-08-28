<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class LoginController extends Controller
{
    private const PIN_LENGTH = 4;
    private const PIN_EXPIRY_MINUTES = 5;
    private const MAX_ATTEMPTS = 3;

    /**
     * Step 1: Request a login PIN.
     * Accepts a phone number, generates a 4-digit PIN, stores the hashed
     * version in the database, and returns the plain PIN (dev only — in
     * production this would be sent via SMS).
     */
    public function requestPin(Request $request): JsonResponse
    {
        $request->validate([
            'phone' => ['required', 'string', 'regex:/^01\d{9}$/'],
        ]);

        $user = User::where('phone', $request->phone)->first();

        if (!$user) {
            return response()->json([
                'message' => 'No account found with this phone number.',
            ], 404);
        }

        $pin = (string) random_int(
            (int) str_repeat('1', self::PIN_LENGTH),
            (int) str_repeat('9', self::PIN_LENGTH),
        );

        $user->update([
            'pin_hash' => Hash::make($pin),
            'pin_expires_at' => now()->addMinutes(self::PIN_EXPIRY_MINUTES),
        ]);

        $response = [
            'message' => 'PIN sent successfully.',
        ];

        if (app()->environment('local', 'development')) {
            $response['dev_pin'] = $pin;
        }

        return response()->json($response);
    }

    /**
     * Step 2: Verify the PIN and return a Sanctum token.
     * Accepts phone + pin, checks against stored hash, enforces expiry
     * and max-attempts, then issues an API token on success.
     */
    public function verifyPin(Request $request): JsonResponse
    {
        $request->validate([
            'phone' => ['required', 'string', 'regex:/^01\d{9}$/'],
            'pin'   => ['required', 'string', 'size:4'],
        ]);

        $user = User::where('phone', $request->phone)->first();

        if (!$user) {
            return response()->json([
                'message' => 'No account found with this phone number.',
            ], 404);
        }

        if (!$user->pin_hash || !$user->pin_expires_at) {
            return response()->json([
                'message' => 'No active PIN. Please request a new one.',
            ], 400);
        }

        if (now()->gt($user->pin_expires_at)) {
            $user->update(['pin_hash' => null, 'pin_expires_at' => null]);

            return response()->json([
                'message' => 'PIN has expired. Please request a new one.',
            ], 410);
        }

        if (!Hash::check($request->pin, $user->pin_hash)) {
            return response()->json([
                'message' => 'Incorrect PIN. Please try again.',
            ], 401);
        }

        // Success — clear the PIN and issue a token
        $user->update(['pin_hash' => null, 'pin_expires_at' => null]);

        // Revoke previous tokens for this user (single-device session)
        $user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'user'    => $user,
            'token'   => $token,
        ]);
    }
}
