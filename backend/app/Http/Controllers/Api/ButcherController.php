<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ButcherService;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

/**
 * Adnan Bin Aman: Lists verified butchers and manages their profiles, services, and schedules.
 */
class ButcherController extends Controller
{
    /** Adnan: Filter and sort real verified butcher records for the customer directory. */
    public function index(Request $request): JsonResponse
    {
        $query = User::query()
            ->where('role', 'butcher')
            ->whereHas('butcherProfile', fn (Builder $profile) => $profile
                ->where('verification_status', 'verified')
                ->whereNotNull('area'))
            ->with(['butcherProfile', 'services' => fn ($services) => $services->where('is_available', true)])
            ->withAvg(['reviews as average_rating' => fn (Builder $reviews) => $reviews->where('status', 'published')], 'rating')
            ->withCount(['reviews as review_count' => fn (Builder $reviews) => $reviews->where('status', 'published')])
            ->withCount(['butcherBookings as completed_services_count' => fn (Builder $bookings) => $bookings->where('status', 'Completed')]);

        $query->when($request->filled('search'), function (Builder $query) use ($request): void {
            $search = trim($request->string('search')->toString());
            $query->where(function (Builder $searchQuery) use ($search): void {
                $searchQuery->where('name', 'like', "%{$search}%")
                    ->orWhereHas('butcherProfile', fn (Builder $profile) => $profile
                        ->where('area', 'like', "%{$search}%")
                        ->orWhere('city', 'like', "%{$search}%"))
                    ->orWhereHas('services', fn (Builder $services) => $services
                        ->where('animal', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%"));
            });
        });
        $query->when($request->filled('area'), fn (Builder $query) => $query->whereHas('butcherProfile', fn (Builder $profile) => $profile->where('area', $request->string('area')->toString())));
        $query->when($request->filled('city'), fn (Builder $query) => $query->whereHas('butcherProfile', fn (Builder $profile) => $profile->where('city', $request->string('city')->toString())));
        $query->when($request->filled('animal'), fn (Builder $query) => $query->whereHas('services', fn (Builder $services) => $services->where('animal', $request->string('animal')->toString())->where('is_available', true)));
        $query->when($request->filled('service'), fn (Builder $query) => $query->whereHas('services', fn (Builder $services) => $services->where('category', $request->string('service')->toString())->where('is_available', true)));
        $query->when($request->filled('minimum_price'), fn (Builder $query) => $query->whereHas('services', fn (Builder $services) => $services->where('price', '>=', $request->integer('minimum_price'))->where('is_available', true)));
        $query->when($request->filled('maximum_price'), fn (Builder $query) => $query->whereHas('services', fn (Builder $services) => $services->where('price', '<=', $request->integer('maximum_price'))->where('is_available', true)));
        $query->when($request->filled('minimum_rating'), fn (Builder $query) => $query->whereRaw(
            '(select avg(rating) from reviews where reviews.butcher_id = users.id and reviews.status = ?) >= ?',
            ['published', $request->float('minimum_rating')],
        ));
        $query->when($request->boolean('available'), fn (Builder $query) => $query->whereHas('butcherProfile', fn (Builder $profile) => $profile->where('is_available', true)));

        $sort = $request->string('sort', 'recommended')->toString();
        match ($sort) {
            'rating' => $query->orderByDesc('average_rating'),
            'price-low' => $query->orderBy(ButcherService::query()
                ->select('price')
                ->whereColumn('butcher_id', 'users.id')
                ->where('is_available', true)
                ->orderBy('price')
                ->limit(1)),
            'price-high' => $query->orderByDesc(ButcherService::query()
                ->select('price')
                ->whereColumn('butcher_id', 'users.id')
                ->where('is_available', true)
                ->orderByDesc('price')
                ->limit(1)),
            'completed' => $query->orderByDesc('completed_services_count'),
            default => $query->orderByDesc('average_rating')->orderByDesc('review_count'),
        };

        $butchers = $query->paginate(min($request->integer('per_page', 24), 100));

        return response()->json($butchers);
    }

    /** Adnan: Show a verified butcher's public profile, available services, schedule, and reviews. */
    public function show(User $butcher): JsonResponse
    {
        abort_unless($butcher->role === 'butcher', 404);
        abort_unless($butcher->butcherProfile?->verification_status === 'verified', 404);

        $butcher->load([
            'butcherProfile',
            'services' => fn ($services) => $services->where('is_available', true),
            'availabilitySchedules' => fn ($schedules) => $schedules->where('is_enabled', true)->orderBy('weekday'),
        ]);
        $butcher->loadAvg(['reviews as average_rating' => fn (Builder $reviews) => $reviews->where('status', 'published')], 'rating');
        $butcher->loadCount(['reviews as review_count' => fn (Builder $reviews) => $reviews->where('status', 'published')]);
        $reviews = $butcher->reviews()
            ->where('status', 'published')
            ->with('customer:id,name')
            ->latest()
            ->paginate(10);

        return response()->json(['butcher' => $butcher, 'reviews' => $reviews]);
    }

    /** Adnan: Return the signed-in butcher's editable profile and account contact details. */
    public function profile(Request $request): JsonResponse
    {
        $profile = $request->user()->butcherProfile;
        if (! $profile) {
            $profile = $request->user()->butcherProfile()->create(['area' => null, 'city' => 'Dhaka']);
        }

        return response()->json(['profile' => $profile->load('user:id,name,phone,email')]);
    }

    /** Adnan: Update only profile fields the butcher is allowed to manage. */
    public function updateProfile(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'nullable', 'email', 'max:255', Rule::unique('users')->ignore($request->user()->id)],
            'bio' => ['sometimes', 'nullable', 'string', 'max:3000'],
            'area' => ['sometimes', 'required', 'string', 'max:120'],
            'city' => ['sometimes', 'required', 'string', 'max:120'],
            'service_areas' => ['sometimes', 'array', 'max:30'],
            'service_areas.*' => ['string', 'max:120'],
            'specializations' => ['sometimes', 'array', 'max:30'],
            'specializations.*' => ['string', 'max:160'],
        ]);

        $user = $request->user();
        DB::transaction(function () use ($validated, $user): void {
            if (isset($validated['name']) || array_key_exists('email', $validated)) {
                $user->update(array_intersect_key($validated, array_flip(['name', 'email'])));
            }

            $profile = $user->butcherProfile()->firstOrCreate([], ['area' => null, 'city' => 'Dhaka']);
            $profile->update(array_intersect_key($validated, array_flip([
                'bio', 'area', 'city', 'service_areas', 'specializations',
            ])));
        });

        return response()->json(['profile' => $user->fresh()->load('butcherProfile')->butcherProfile]);
    }

    /** Adnan: List service records owned by the signed-in butcher. */
    public function services(Request $request): JsonResponse
    {
        return response()->json(['services' => $request->user()->services()->latest()->get()]);
    }

    /** Adnan: Validate and save a new service under the signed-in butcher's account. */
    public function createService(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:160'],
            'animal' => ['required', 'string', 'max:80'],
            'category' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:2000'],
            'price' => ['required', 'integer', 'min:1', 'max:10000000'],
            'duration' => ['nullable', 'string', 'max:80'],
            'additional' => ['sometimes', 'nullable', 'string', 'max:120'],
            'is_available' => ['sometimes', 'boolean'],
        ]);

        $service = $request->user()->services()->create($validated);

        return response()->json(['service' => $service], 201);
    }

    /** Adnan: Update a service only when it belongs to the signed-in butcher. */
    public function updateService(Request $request, ButcherService $service): JsonResponse
    {
        abort_unless($service->butcher_id === $request->user()->id, 404);

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:160'],
            'animal' => ['sometimes', 'required', 'string', 'max:80'],
            'category' => ['sometimes', 'required', 'string', 'max:120'],
            'description' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'price' => ['sometimes', 'required', 'integer', 'min:1', 'max:10000000'],
            'duration' => ['sometimes', 'nullable', 'string', 'max:80'],
            'additional' => ['sometimes', 'nullable', 'string', 'max:120'],
            'is_available' => ['sometimes', 'boolean'],
        ]);
        $service->update($validated);

        return response()->json(['service' => $service->fresh()]);
    }

    /** Adnan: Prevent deleting a service while customers still have active bookings for it. */
    public function deleteService(Request $request, ButcherService $service): JsonResponse
    {
        abort_unless($service->butcher_id === $request->user()->id, 404);
        abort_if($service->bookings()->whereIn('status', ['Pending', 'Confirmed', 'In Progress'])->exists(), 409, 'This service has active bookings and cannot be removed.');
        $service->delete();

        return response()->json(['message' => 'Service removed.']);
    }

    /** Adnan: Return weekly working hours, date exceptions, and the butcher's overall availability. */
    public function availability(Request $request): JsonResponse
    {
        return response()->json([
            'is_available' => (bool) $request->user()->butcherProfile?->is_available,
            'daily_capacity' => $request->user()->butcherProfile?->daily_capacity,
            'schedule' => $request->user()->availabilitySchedules()->orderBy('weekday')->get(),
            'exceptions' => $request->user()->availabilityExceptions()->orderBy('date')->get(),
        ]);
    }

    /** Adnan: Save weekly hours and date overrides so future booking requests can be checked. */
    public function updateAvailability(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'is_available' => ['sometimes', 'boolean'],
            'daily_capacity' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'schedule' => ['sometimes', 'array', 'size:7'],
            'schedule.*.weekday' => ['required', 'integer', 'between:0,6', 'distinct'],
            'schedule.*.is_enabled' => ['required', 'boolean'],
            'schedule.*.starts_at' => ['nullable', 'date_format:H:i'],
            'schedule.*.ends_at' => ['nullable', 'date_format:H:i', 'after:schedule.*.starts_at'],
            'schedule.*.capacity' => ['required', 'integer', 'min:1', 'max:100'],
            'exceptions' => ['sometimes', 'array', 'max:100'],
            'exceptions.*.date' => ['required', 'date', 'distinct'],
            'exceptions.*.is_available' => ['required', 'boolean'],
            'exceptions.*.starts_at' => ['nullable', 'date_format:H:i'],
            'exceptions.*.ends_at' => ['nullable', 'date_format:H:i'],
            'exceptions.*.capacity' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        DB::transaction(function () use ($request, $validated): void {
            $profile = $request->user()->butcherProfile()->firstOrCreate([], ['area' => null, 'city' => 'Dhaka']);
            $profile->update(array_intersect_key($validated, array_flip(['is_available', 'daily_capacity'])));

            foreach ($validated['schedule'] ?? [] as $day) {
                $request->user()->availabilitySchedules()->updateOrCreate(
                    ['weekday' => $day['weekday']],
                    $day,
                );
            }

            foreach ($validated['exceptions'] ?? [] as $exception) {
                $request->user()->availabilityExceptions()->updateOrCreate(
                    ['date' => $exception['date']],
                    $exception,
                );
            }
        });

        return $this->availability($request);
    }
}
