<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\ButcherService;
use App\Services\NotificationService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/**
 * Adnan Bin Aman: Creates and retrieves bookings while enforcing access and service rules.
 */
class BookingController extends Controller
{
    /** Adnan: Return only this customer's bookings, including related service and payment details. */
    public function customerIndex(Request $request): JsonResponse
    {
        $bookings = Booking::query()
            ->where('customer_id', $request->user()->id)
            ->with(['butcher:id,name,phone', 'butcher.butcherProfile', 'service', 'payments', 'review'])
            ->latest()
            ->paginate(min($request->integer('per_page', 30), 100));

        return response()->json($bookings);
    }

    /** Adnan: Return only this butcher's bookings, optionally filtered by their current status. */
    public function butcherIndex(Request $request): JsonResponse
    {
        $bookings = Booking::query()
            ->where('butcher_id', $request->user()->id)
            ->with(['customer:id,name,phone', 'service', 'payments', 'review'])
            ->when($request->filled('status'), fn (Builder $query) => $query->where('status', $request->string('status')->toString()))
            ->orderBy('service_date')
            ->orderBy('service_time')
            ->paginate(min($request->integer('per_page', 30), 100));

        return response()->json($bookings);
    }

    /** Adnan: Validate the request, reserve an available time slot, save the booking, and notify the butcher. */
    public function store(Request $request, NotificationService $notifications): JsonResponse
    {
        $validated = $request->validate([
            'service_id' => ['required', 'integer', 'exists:butcher_services,id'],
            'service_date' => ['required', 'date', 'after_or_equal:today'],
            'service_time' => ['required', 'date_format:H:i'],
            'address' => ['required', 'string', 'max:255'],
            'area' => ['required', 'string', 'max:120'],
            'city' => ['required', 'string', 'max:120'],
            'instructions' => ['nullable', 'string', 'max:2000'],
        ]);

        // Adnan: Lock the chosen service while checking the schedule and capacity to reduce double-booking.
        $booking = DB::transaction(function () use ($request, $validated, $notifications): Booking {
            $service = ButcherService::query()
                ->whereKey($validated['service_id'])
                ->where('is_available', true)
                ->with(['butcher.butcherProfile'])
                ->lockForUpdate()
                ->firstOrFail();
            $butcher = $service->butcher;
            $profile = $butcher->butcherProfile;
            abort_unless($butcher->role === 'butcher' && $profile?->verification_status === 'verified', 422, 'This butcher is not currently accepting bookings.');
            abort_unless($profile->is_available, 422, 'This butcher is currently unavailable.');

            // Adnan: Date exceptions override the repeating weekly hours for holidays and special openings.
            $serviceDate = $validated['service_date'];
            $dateException = $butcher->availabilityExceptions()->whereDate('date', $serviceDate)->first();
            if ($dateException) {
                abort_unless($dateException->is_available, 422, 'The butcher is unavailable on the selected date.');
                $capacity = $dateException->capacity ?? $profile->daily_capacity;
                $startTime = $dateException->starts_at;
                $endTime = $dateException->ends_at;
            } else {
                $weekday = (int) date('w', strtotime($serviceDate));
                $schedule = $butcher->availabilitySchedules()->where('weekday', $weekday)->first();
                abort_unless($schedule?->is_enabled, 422, 'The butcher has no working hours on the selected date.');
                $capacity = $schedule->capacity;
                $startTime = $schedule->starts_at;
                $endTime = $schedule->ends_at;
            }

            if ($startTime && $endTime) {
                $serviceTime = substr($validated['service_time'], 0, 5);
                $startTime = substr((string) $startTime, 0, 5);
                $endTime = substr((string) $endTime, 0, 5);
                abort_unless($serviceTime >= $startTime && $serviceTime < $endTime, 422, 'The selected time is outside the butcher’s working hours.');
            }

            // Adnan: Count active reservations before accepting another booking for the same date.
            $activeCount = Booking::query()
                ->where('butcher_id', $butcher->id)
                ->whereDate('service_date', $serviceDate)
                ->whereIn('status', ['Pending', 'Confirmed', 'In Progress'])
                ->lockForUpdate()
                ->count();
            abort_if($activeCount >= $capacity, 422, 'The butcher has reached the booking capacity for this date.');

            do {
                $reference = 'QBX-'.now()->format('Y').'-'.Str::upper(Str::random(8));
            } while (Booking::where('reference', $reference)->exists());

            // Adnan: Store booking and advance amounts as unpaid; a booking request is not proof of payment.
            $advance = (int) ceil($service->price * 0.2);
            $booking = Booking::create([
                'reference' => $reference,
                'customer_id' => $request->user()->id,
                'butcher_id' => $butcher->id,
                'service_id' => $service->id,
                'service_date' => $serviceDate,
                'service_time' => $validated['service_time'],
                'address' => $validated['address'],
                'area' => $validated['area'],
                'city' => $validated['city'],
                'instructions' => $validated['instructions'] ?? null,
                'total_amount' => $service->price,
                'advance_amount' => $advance,
                'remaining_amount' => $service->price - $advance,
                'status' => 'Pending',
                'payment_status' => 'Unpaid',
            ]);

            $notifications->send(
                $butcher,
                'booking',
                'New booking request',
                "A customer requested {$service->name} for {$serviceDate}.",
                $booking,
            );

            return $booking;
        });

        return response()->json([
            'message' => 'Booking request created. Complete the advance payment separately to confirm payment.',
            'booking' => $booking->load(['butcher:id,name,phone', 'service', 'payments']),
        ], 201);
    }

    /** Adnan: Show a booking only to its customer, its butcher, or an administrator. */
    public function show(Request $request, Booking $booking): JsonResponse
    {
        abort_unless(in_array($request->user()->id, [$booking->customer_id, $booking->butcher_id], true)
            || $request->user()->role === 'admin', 404);

        return response()->json([
            'booking' => $booking->load(['customer:id,name,phone', 'butcher:id,name,phone', 'butcher.butcherProfile', 'service', 'payments', 'review']),
        ]);
    }

    /** Adnan: Allow only valid customer/butcher status changes and notify the other participant. */
    public function updateStatus(Request $request, Booking $booking, NotificationService $notifications): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(['Confirmed', 'In Progress', 'Completed', 'Cancelled'])],
            'cancellation_reason' => ['nullable', 'string', 'max:1000'],
        ]);

        $user = $request->user();
        $next = $validated['status'];
        $isButcher = $user->id === $booking->butcher_id;
        $isCustomer = $user->id === $booking->customer_id;
        abort_unless($isButcher || $isCustomer, 404);

        // Adnan: Encode the booking lifecycle here so users cannot skip required steps.
        $allowed = match (true) {
            $isButcher && $booking->status === 'Pending' => ['Confirmed', 'Cancelled'],
            $isButcher && $booking->status === 'Confirmed' => ['In Progress', 'Cancelled'],
            $isButcher && $booking->status === 'In Progress' => ['Completed'],
            $isCustomer && in_array($booking->status, ['Pending', 'Confirmed'], true) => ['Cancelled'],
            default => [],
        };
        abort_unless(in_array($next, $allowed, true), 422, 'This booking status transition is not allowed.');

        DB::transaction(function () use ($booking, $next, $validated, $isButcher, $notifications): void {
            $booking->update([
                'status' => $next,
                'cancellation_reason' => $next === 'Cancelled' ? ($validated['cancellation_reason'] ?? null) : null,
                'completed_at' => $next === 'Completed' ? now() : $booking->completed_at,
            ]);
            $recipient = $isButcher ? $booking->customer : $booking->butcher;
            $notifications->send(
                $recipient,
                'booking',
                "Booking {$next}",
                "Booking {$booking->reference} is now {$next}.",
                $booking,
            );
        });

        return response()->json(['booking' => $booking->fresh()->load(['customer:id,name,phone', 'butcher:id,name,phone', 'service', 'payments'])]);
    }
}
