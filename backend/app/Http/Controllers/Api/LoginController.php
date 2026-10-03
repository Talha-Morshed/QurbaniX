<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

/**
 * Adnan Bin Aman: Issues and verifies short-lived phone PINs before creating login tokens.
 */
class LoginController extends Controller
{
    /** Adnan: Keep PIN expiry and retry limits together so the login rules are easy to change. */
    private const PIN_LENGTH = 4;

    private const PIN_EXPIRY_MINUTES = 5;

    private const MAX_ATTEMPTS = 3;

    /**
     * Step 1: Request a login PIN.
     * Accepts a phone number, generates a 4-digit PIN, stores the hashed
     * version in the database, and returns the plain PIN for the demo flow.
     */
    /** Adnan: Create a hashed, expiring PIN and return it for the demo login flow. */
    public function requestPin(Request $request): JsonResponse
    {
        $phone = $request->input('phone');
        if (is_string($phone)) {
            $request->merge(['phone' => trim($phone)]);
        }
        $request->validate([
            'phone' => ['required', 'string', 'regex:/^01\d{9}$/'],
        ]);

        $user = User::where('phone', $request->phone)->first();

        if (! $user) {
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
            'pin_attempts' => 0,
        ]);

        return response()->json([
            'message' => 'PIN sent successfully.',
            'dev_pin' => $pin,
        ]);
    }

    /**
     * Step 2: Verify the PIN and return a Sanctum token.
     * Accepts phone + pin, checks against stored hash, enforces expiry
     * and max-attempts, then issues an API token on success.
     */
    /** Adnan: Check expiry and retry limits, then issue a token only after a correct PIN. */
    public function verifyPin(Request $request): JsonResponse
    {
        $phone = $request->input('phone');
        if (is_string($phone)) {
            $request->merge(['phone' => trim($phone)]);
        }
        $request->validate([
            'phone' => ['required', 'string', 'regex:/^01\d{9}$/'],
            'pin' => ['required', 'string', 'size:4'],
        ]);

        $user = User::where('phone', $request->phone)->first();

        if (! $user) {
            return response()->json([
                'message' => 'No account found with this phone number.',
            ], 404);
        }

        if (! $user->pin_hash || ! $user->pin_expires_at) {
            return response()->json([
                'message' => 'No active PIN. Please request a new one.',
            ], 400);
        }

        if (($user->pin_attempts ?? 0) >= self::MAX_ATTEMPTS) {
            $user->update(['pin_hash' => null, 'pin_expires_at' => null, 'pin_attempts' => 0]);

            return response()->json(['message' => 'Too many incorrect PIN attempts. Request a new PIN.'], 429);
        }

        if (now()->gt($user->pin_expires_at)) {
            $user->update(['pin_hash' => null, 'pin_expires_at' => null, 'pin_attempts' => 0]);

            return response()->json([
                'message' => 'PIN has expired. Please request a new one.',
            ], 410);
        }

        if (! Hash::check($request->pin, $user->pin_hash)) {
            $user->increment('pin_attempts');

            return response()->json([
                'message' => ($user->pin_attempts >= self::MAX_ATTEMPTS)
                    ? 'Too many incorrect PIN attempts. Request a new PIN.'
                    : 'Incorrect PIN. Please try again.',
            ], $user->pin_attempts >= self::MAX_ATTEMPTS ? 429 : 401);
        }

        // Adnan: Clear the one-time PIN after success so it cannot be reused.
        $user->update(['pin_hash' => null, 'pin_expires_at' => null, 'pin_attempts' => 0]);

        // Adnan: Keep only one active login session for this account.
        $user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'user' => $user,
            'token' => $token,
        ]);
    }
}
