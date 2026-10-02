<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

/**
 * Adnan Bin Aman: Records booking payments and requires both parties to confirm cash payments.
 */
class PaymentController extends Controller
{
    /** Adnan: Record an amount due without pretending an unconfigured online gateway processed it. */
    public function store(Request $request, Booking $booking, NotificationService $notifications): JsonResponse
    {
        abort_unless($booking->customer_id === $request->user()->id, 404);
        abort_if($booking->status === 'Cancelled', 422, 'Cancelled bookings cannot be paid.');
        $validated = $request->validate([
            'purpose' => ['required', Rule::in(['advance', 'balance'])],
            'method' => ['required', Rule::in(['cash', 'bkash', 'nagad', 'card'])],
        ]);

        $amount = match ($validated['purpose']) {
            'advance' => $booking->advance_amount,
            'balance' => $booking->remaining_amount,
        };
        abort_if($amount <= 0, 409, 'There is no outstanding amount for this payment.');
        abort_if(
            $booking->payments()->where('purpose', $validated['purpose'])->whereIn('status', ['pending', 'paid'])->exists(),
            409,
            'A payment for this amount has already been recorded.',
        );
        abort_if($validated['purpose'] === 'balance' && $booking->status !== 'Completed', 422, 'The remaining balance is payable after service completion.');

        $payment = DB::transaction(function () use ($booking, $request, $validated, $amount, $notifications): Payment {
            $payment = $booking->payments()->create([
                'payer_id' => $request->user()->id,
                'amount' => $amount,
                'purpose' => $validated['purpose'],
                'method' => $validated['method'],
                'status' => 'pending',
            ]);
            $booking->update(['payment_status' => 'Payment pending']);
            $notifications->send(
                $booking->butcher,
                'payment',
                'Payment recorded for confirmation',
                "The customer recorded a {$validated['purpose']} payment for booking {$booking->reference}.",
                $booking,
            );

            return $payment;
        });

        return response()->json([
            'message' => $validated['method'] === 'cash'
                ? 'Cash payment recorded. Both parties must confirm receipt.'
                : 'Payment request recorded as pending. A configured payment gateway is required to collect this online payment.',
            'payment' => $payment,
        ], 201);
    }

    /** Adnan: Complete cash payment only after both the payer and receiver confirm it. */
    public function confirm(Request $request, Payment $payment, NotificationService $notifications): JsonResponse
    {
        $payment->load('booking');
        $booking = $payment->booking;
        abort_unless(in_array($request->user()->id, [$booking->customer_id, $booking->butcher_id], true), 404);
        abort_unless($payment->method === 'cash', 422, 'Online payments can only be confirmed by a configured provider callback.');
        abort_if($payment->status !== 'pending', 409, 'This payment is no longer pending.');

        DB::transaction(function () use ($request, $payment, $booking, $notifications): void {
            if ($request->user()->id === $payment->payer_id) {
                $payment->payer_confirmed_at ??= now();
            } else {
                $payment->receiver_confirmed_at ??= now();
            }

            if ($payment->payer_confirmed_at && $payment->receiver_confirmed_at) {
                $payment->status = 'paid';
                $payment->confirmed_by = $request->user()->id;
                $payment->confirmed_at = now();
                if ($payment->purpose === 'advance') {
                    $booking->payment_status = 'Advance paid';
                } else {
                    $booking->payment_status = 'Paid in full';
                    $booking->remaining_amount = 0;
                }
                $booking->save();
                $recipientId = $request->user()->id === $booking->customer_id ? $booking->butcher_id : $booking->customer_id;
                $notifications->send(
                    $booking->customer_id === $recipientId ? $booking->customer : $booking->butcher,
                    'payment',
                    'Cash payment confirmed',
                    "The {$payment->purpose} payment for booking {$booking->reference} was confirmed by both parties.",
                    $booking,
                );
            }

            $payment->save();
        });

        return response()->json([
            'message' => $payment->fresh()->status === 'paid'
                ? 'Payment confirmed by both parties.'
                : 'Your confirmation is recorded. The other party must confirm receipt.',
            'payment' => $payment->fresh(),
            'booking' => $booking->fresh(),
        ]);
    }

    /** Record the customer's confirmation for a cash payment. */
    public function confirmCustomer(Request $request, Payment $payment, NotificationService $notifications): JsonResponse
    {
        [$payment, $booking] = DB::transaction(function () use ($request, $payment, $notifications): array {
            $payment = Payment::query()->whereKey($payment->id)->lockForUpdate()->firstOrFail();
            $booking = Booking::query()->whereKey($payment->booking_id)->lockForUpdate()->firstOrFail();

            abort_unless($booking->customer_id === $request->user()->id, 404);
            abort_unless($payment->method === 'cash', 422, 'Online payments can only be confirmed by a configured provider callback.');
            abort_if($booking->status === 'Cancelled', 422, 'Cancelled bookings cannot be paid.');
            abort_if($payment->status !== 'pending', 409, 'This payment is no longer pending.');
            abort_if($payment->payer_confirmed_at !== null, 409, 'You have already confirmed this payment.');

            $payment->payer_confirmed_at = now();

            if ($payment->receiver_confirmed_at) {
                $payment->status = 'paid';
                $payment->confirmed_by = $request->user()->id;
                $payment->confirmed_at = now();
                if ($payment->purpose === 'advance') {
                    $booking->payment_status = 'Advance paid';
                } else {
                    $booking->payment_status = 'Paid in full';
                    $booking->remaining_amount = 0;
                }
                $booking->save();
                $notifications->send(
                    $booking->butcher,
                    'payment',
                    'Cash payment confirmed',
                    "The {$payment->purpose} payment for booking {$booking->reference} was confirmed by both parties.",
                    $booking,
                );
            }

            $payment->save();

            return [$payment, $booking];
        });

        $payment = $payment->fresh();
        $booking = $booking->fresh();

        return response()->json([
            'message' => $payment->status === 'paid'
                ? 'Payment confirmed by both parties.'
                : 'Your confirmation is recorded. The other party must confirm receipt.',
            'payment' => $payment,
            'booking' => $booking,
        ]);
    }

    /** Adnan: Return payment history only for bookings involving the signed-in user. */
    public function index(Request $request): JsonResponse
    {
        return response()->json(
            Payment::query()
                ->whereHas('booking', fn ($query) => $query->where(function ($query) use ($request): void {
                    $query->where('customer_id', $request->user()->id)
                        ->orWhere('butcher_id', $request->user()->id);
                }))
                ->with('booking:id,reference,status')
                ->latest()
                ->paginate(min($request->integer('per_page', 30), 100))
        );
    }
}
