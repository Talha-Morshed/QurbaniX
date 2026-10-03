<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\CustomerAddress;
use App\Models\Review;
use App\Models\User;
use App\Services\ButcherMatchingService;
use App\Services\NotificationService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

/**
 * Adnan Bin Aman: Manages customer records and selected administrator marketplace operations.
 */
class CustomerController extends Controller
{
    /** Return verified butchers ranked against the signed-in customer's preferences. */
    public function butcherMatches(Request $request, ButcherMatchingService $matching): JsonResponse
    {
        $validated = $request->validate([
            'animal_type' => ['required', 'string', Rule::in(['goat', 'cow', 'sheep', 'camel'])],
            'area' => ['sometimes', 'nullable', 'string', 'max:120'],
            'city' => ['sometimes', 'nullable', 'string', 'max:120'],
            'date' => ['required', 'date', 'after_or_equal:today'],
            'time' => ['sometimes', 'nullable', 'date_format:H:i'],
            'max_budget' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'min_rating' => ['sometimes', 'nullable', 'numeric', 'min:1', 'max:5'],
            'service_category' => ['sometimes', 'nullable', 'string', 'max:120'],
        ]);

        return response()->json(['data' => $matching->match($validated)]);
    }

    /** Adnan: Return the signed-in customer's database profile, addresses, and notification preferences. */
    public function profile(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $request->user()->load('customerAddresses'),
            'preferences' => $request->user()->preferences ?? [
                'booking_updates' => true,
                'payment_updates' => true,
                'butcher_messages' => true,
                'review_notifications' => true,
                'promotions' => false,
            ],
        ]);
    }

    /** Adnan: Persist profile edits and notification preferences for the current customer. */
    public function updateProfile(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'nullable', 'email', 'max:255', Rule::unique('users')->ignore($request->user()->id)],
            'preferences' => ['sometimes', 'array'],
            'preferences.booking_updates' => ['sometimes', 'boolean'],
            'preferences.payment_updates' => ['sometimes', 'boolean'],
            'preferences.butcher_messages' => ['sometimes', 'boolean'],
            'preferences.review_notifications' => ['sometimes', 'boolean'],
            'preferences.promotions' => ['sometimes', 'boolean'],
        ]);
        $request->user()->update($validated);

        return $this->profile($request);
    }

    /** Adnan: Save a customer address and ensure the customer has at most one default address. */
    public function createAddress(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'label' => ['required', 'string', 'max:80'],
            'address' => ['required', 'string', 'max:255'],
            'area' => ['required', 'string', 'max:120'],
            'city' => ['required', 'string', 'max:120'],
            'instructions' => ['nullable', 'string', 'max:1000'],
            'is_default' => ['sometimes', 'boolean'],
        ]);
        $address = DB::transaction(function () use ($request, $validated): CustomerAddress {
            if (($validated['is_default'] ?? false) || ! $request->user()->customerAddresses()->exists()) {
                $request->user()->customerAddresses()->update(['is_default' => false]);
                $validated['is_default'] = true;
            }

            return $request->user()->customerAddresses()->create($validated);
        });

        return response()->json(['address' => $address], 201);
    }

    /** Adnan: Update an address only if it belongs to this customer. */
    public function updateAddress(Request $request, CustomerAddress $address): JsonResponse
    {
        abort_unless($address->user_id === $request->user()->id, 404);
        $validated = $request->validate([
            'label' => ['sometimes', 'required', 'string', 'max:80'],
            'address' => ['sometimes', 'required', 'string', 'max:255'],
            'area' => ['sometimes', 'required', 'string', 'max:120'],
            'city' => ['sometimes', 'required', 'string', 'max:120'],
            'instructions' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'is_default' => ['sometimes', 'boolean'],
        ]);

        DB::transaction(function () use ($request, $address, $validated): void {
            if ($validated['is_default'] ?? false) {
                $request->user()->customerAddresses()->whereKeyNot($address->id)->update(['is_default' => false]);
            }
            $address->update($validated);
        });

        return response()->json(['address' => $address->fresh()]);
    }

    /** Adnan: Remove an address only from the signed-in customer's own address list. */
    public function deleteAddress(Request $request, CustomerAddress $address): JsonResponse
    {
        abort_unless($address->user_id === $request->user()->id, 404);
        $address->delete();

        return response()->json(['message' => 'Address removed.']);
    }

    /** Adnan: Return reviews written by the signed-in customer with their booking details. */
    public function reviews(Request $request): JsonResponse
    {
        $reviews = Review::query()
            ->where('customer_id', $request->user()->id)
            ->with(['booking.service', 'butcher:id,name'])
            ->latest()
            ->paginate(min($request->integer('per_page', 30), 100));

        return response()->json($reviews);
    }

    /** Adnan: Accept one review only from the booking's customer after the service is completed. */
    public function createReview(Request $request, Booking $booking, NotificationService $notifications): JsonResponse
    {
        abort_unless($booking->customer_id === $request->user()->id, 404);
        abort_unless($booking->status === 'Completed', 422, 'Reviews can only be submitted after a booking is completed.');
        abort_if($booking->review()->exists(), 409, 'A review has already been submitted for this booking.');

        $validated = $request->validate([
            'rating' => ['required', 'integer', 'between:1,5'],
            'service_rating' => ['nullable', 'integer', 'between:1,5'],
            'professionalism_rating' => ['nullable', 'integer', 'between:1,5'],
            'punctuality_rating' => ['nullable', 'integer', 'between:1,5'],
            'cleanliness_rating' => ['nullable', 'integer', 'between:1,5'],
            'comment' => ['required', 'string', 'min:5', 'max:2000'],
            'recommendation' => ['nullable', 'string', Rule::in(['yes', 'no'])],
        ]);

        $review = DB::transaction(function () use ($booking, $request, $validated, $notifications): Review {
            $review = $booking->review()->create([
                ...$validated,
                'customer_id' => $request->user()->id,
                'butcher_id' => $booking->butcher_id,
                'status' => 'published',
            ]);
            $notifications->send(
                $booking->butcher,
                'review',
                'New customer review',
                "A customer reviewed booking {$booking->reference}.",
                $booking,
            );

            return $review;
        });

        return response()->json(['review' => $review->load(['booking.service', 'butcher:id,name'])], 201);
    }

    /** Adnan: Let a butcher read only the reviews written about their own services. */
    public function butcherReviews(Request $request): JsonResponse
    {
        return response()->json(
            Review::query()
                ->where('butcher_id', $request->user()->id)
                ->with(['customer:id,name', 'booking.service'])
                ->latest()
                ->paginate(min($request->integer('per_page', 30), 100))
        );
    }

    /** Adnan: Return the signed-in user's persisted notifications, newest first. */
    public function notifications(Request $request): JsonResponse
    {
        return response()->json(
            $request->user()->userNotifications()
                ->with('booking:id,reference,status')
                ->latest()
                ->paginate(min($request->integer('per_page', 40), 100))
        );
    }

    /** Adnan: Mark one notification as read only when it belongs to the signed-in user. */
    public function markNotificationRead(Request $request, int $notificationId): JsonResponse
    {
        $notification = $request->user()->userNotifications()->findOrFail($notificationId);
        $notification->update(['read_at' => now()]);

        return response()->json(['notification' => $notification->fresh()]);
    }

    /** Adnan: Mark every unread notification owned by this user as read. */
    public function markAllNotificationsRead(Request $request): JsonResponse
    {
        $request->user()->userNotifications()->whereNull('read_at')->update(['read_at' => now()]);

        return response()->json(['message' => 'Notifications marked as read.']);
    }

    /** Adnan: Give administrators a paginated view of platform bookings. */
    public function adminBookings(Request $request): JsonResponse
    {
        $bookings = Booking::query()
            ->with(['customer:id,name,phone', 'butcher:id,name,phone', 'service'])
            ->when($request->filled('status'), fn (Builder $query) => $query->where('status', $request->string('status')->toString()))
            ->latest()
            ->paginate(min($request->integer('per_page', 50), 100));

        return response()->json($bookings);
    }

    /** Adnan: Give administrators a paginated user list with butcher verification details. */
    public function adminUsers(Request $request): JsonResponse
    {
        $users = User::query()
            ->with('butcherProfile')
            ->when($request->filled('role'), fn (Builder $query) => $query->where('role', $request->string('role')->toString()))
            ->latest()
            ->paginate(min($request->integer('per_page', 50), 100));

        return response()->json($users);
    }

    /** Adnan: Let administrators approve, reject, or return a butcher profile to pending review. */
    public function verifyButcher(Request $request, User $butcher): JsonResponse
    {
        abort_unless($butcher->role === 'butcher', 404);
        $validated = $request->validate(['verification_status' => ['required', Rule::in(['verified', 'rejected', 'pending'])]]);
        $profile = $butcher->butcherProfile()->firstOrFail();
        $profile->update([
            'verification_status' => $validated['verification_status'],
            'verified_at' => $validated['verification_status'] === 'verified' ? now() : null,
        ]);

        return response()->json(['profile' => $profile->fresh()]);
    }
}
