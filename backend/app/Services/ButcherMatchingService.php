<?php

namespace App\Services;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class ButcherMatchingService
{
    /**
     * Return verified butchers ranked against the customer's supplied criteria.
     *
     * Scores are additive: animal 30, category 10, availability 25, area 15,
     * city 10, budget 10, and rating 10. Category, location, budget, and rating
     * points are only applicable when the customer supplies those preferences.
     */
    public function match(array $criteria): Collection
    {
        $date = $criteria['date'];
        $weekday = Carbon::parse($date)->dayOfWeek;
        $activeStatuses = ['Pending', 'Confirmed', 'In Progress'];

        $butchers = User::query()
            ->where('role', 'butcher')
            ->whereHas('butcherProfile', fn (Builder $profile) => $profile
                ->where('verification_status', 'verified'))
            ->whereHas('services', fn (Builder $services) => $services->where('is_available', true))
            ->with([
                'butcherProfile',
                'services' => fn ($services) => $services->where('is_available', true)->orderBy('price')->orderBy('id'),
                'availabilitySchedules' => fn ($schedules) => $schedules->where('weekday', $weekday),
                'availabilityExceptions' => fn ($exceptions) => $exceptions->whereDate('date', $date),
                'butcherBookings' => fn ($bookings) => $bookings
                    ->whereDate('service_date', $date)
                    ->whereIn('status', $activeStatuses),
            ])
            ->withAvg(['reviews as average_rating' => fn (Builder $reviews) => $reviews->where('status', 'published')], 'rating')
            ->withCount(['reviews as review_count' => fn (Builder $reviews) => $reviews->where('status', 'published')])
            ->get();

        $matches = $butchers->map(function (User $butcher) use ($criteria): array {
            $rating = $butcher->average_rating !== null ? (float) $butcher->average_rating : null;
            $availability = $this->availabilityFor($butcher, $criteria);
            $selected = $butcher->services
                ->map(fn ($service): array => [
                    'service' => $service,
                    'animal_match' => $this->matchesText($service->animal, $criteria['animal_type']),
                    'category_match' => isset($criteria['service_category'])
                        && $this->matchesText($service->category, $criteria['service_category']),
                    'budget_match' => isset($criteria['max_budget'])
                        && $service->price <= $criteria['max_budget'],
                ])
                ->sort(function (array $left, array $right) use ($criteria): int {
                    $leftScore = ($left['animal_match'] ? 30 : 0)
                        + (isset($criteria['service_category']) && $left['category_match'] ? 10 : 0)
                        + (isset($criteria['max_budget']) && $left['budget_match'] ? 10 : 0);
                    $rightScore = ($right['animal_match'] ? 30 : 0)
                        + (isset($criteria['service_category']) && $right['category_match'] ? 10 : 0)
                        + (isset($criteria['max_budget']) && $right['budget_match'] ? 10 : 0);

                    return ($rightScore <=> $leftScore)
                        ?: ($left['service']->price <=> $right['service']->price)
                        ?: ($left['service']->id <=> $right['service']->id);
                })
                ->first();

            $service = $selected['service'];
            $score = 0;
            $reasons = [];

            if ($selected['animal_match']) {
                $score += 30;
                $reasons[] = 'Supports your selected animal';
            } else {
                $reasons[] = 'Does not support your selected animal';
            }

            if (isset($criteria['service_category'])) {
                if ($selected['category_match']) {
                    $score += 10;
                    $reasons[] = 'Matches your selected service category';
                } else {
                    $reasons[] = 'Does not match your selected service category';
                }
            }

            if ($availability['is_available']) {
                $score += 25;
                $reasons[] = 'Available on your selected date';
                if (isset($criteria['time'])) {
                    $reasons[] = 'Available at your selected time';
                }
            } else {
                $reasons = [...$reasons, ...$availability['reasons']];
            }

            $profile = $butcher->butcherProfile;
            if (isset($criteria['area'])) {
                $areaMatch = $this->matchesText($profile->area, $criteria['area'])
                    || collect($profile->service_areas ?? [])
                        ->contains(fn ($area): bool => $this->matchesText($area, $criteria['area']));
                if ($areaMatch) {
                    $score += 15;
                    $reasons[] = 'Serves your selected area';
                } else {
                    $reasons[] = 'Does not serve your selected area';
                }
            }

            if (isset($criteria['city'])) {
                if ($this->matchesText($profile->city, $criteria['city'])) {
                    $score += 10;
                    $reasons[] = 'Matches your selected city';
                } else {
                    $reasons[] = 'Does not match your selected city';
                }
            }

            if (isset($criteria['max_budget'])) {
                if ($selected['budget_match']) {
                    $score += 10;
                    $reasons[] = 'Within your maximum budget';
                } else {
                    $reasons[] = 'Exceeds your maximum budget';
                }
            }

            if (isset($criteria['min_rating'])) {
                if ($rating !== null && $rating >= $criteria['min_rating']) {
                    $score += 10;
                    $reasons[] = 'Meets your minimum rating';
                } else {
                    $reasons[] = 'Does not meet your minimum rating';
                }
            }

            return [
                'butcher' => [
                    'id' => $butcher->id,
                    'name' => $butcher->name,
                ],
                'profile' => [
                    'bio' => $profile->bio,
                    'area' => $profile->area,
                    'city' => $profile->city,
                    'service_areas' => $profile->service_areas,
                    'specializations' => $profile->specializations,
                ],
                'service' => [
                    'id' => $service->id,
                    'name' => $service->name,
                    'animal' => $service->animal,
                    'category' => $service->category,
                    'description' => $service->description,
                    'price' => $service->price,
                    'duration' => $service->duration,
                    'additional' => $service->additional,
                ],
                'rating' => $rating,
                'review_count' => $butcher->review_count,
                'availability' => $availability,
                'match_score' => $score,
                'match_reasons' => $reasons,
                '_sort_rating' => $rating ?? -1,
                '_sort_price' => $service->price,
            ];
        });

        return $matches
            ->sort(fn (array $left, array $right): int => ($right['match_score'] <=> $left['match_score'])
                ?: ($right['_sort_rating'] <=> $left['_sort_rating'])
                ?: ($left['_sort_price'] <=> $right['_sort_price'])
                ?: ($left['butcher']['id'] <=> $right['butcher']['id']))
            ->map(function (array $match): array {
                unset($match['_sort_rating'], $match['_sort_price']);

                return $match;
            })
            ->values();
    }

    private function availabilityFor(User $butcher, array $criteria): array
    {
        $profile = $butcher->butcherProfile;
        $exception = $butcher->availabilityExceptions->first();
        $schedule = $butcher->availabilitySchedules->first();
        $startsAt = null;
        $endsAt = null;
        $capacity = null;
        $dateReason = null;

        if (! $profile->is_available) {
            $dateReason = 'Butcher is currently unavailable';
        } elseif ($exception) {
            if (! $exception->is_available) {
                $dateReason = 'Unavailable on your selected date';
            } else {
                $startsAt = $exception->starts_at;
                $endsAt = $exception->ends_at;
                $capacity = $exception->capacity ?? $profile->daily_capacity;
            }
        } elseif (! $schedule?->is_enabled) {
            $dateReason = 'No working hours are set for your selected date';
        } else {
            $startsAt = $schedule->starts_at;
            $endsAt = $schedule->ends_at;
            $capacity = $schedule->capacity;
        }

        $bookedCount = $butcher->butcherBookings->count();
        if ($dateReason === null && $bookedCount >= $capacity) {
            $dateReason = 'Booking capacity is full on your selected date';
        }
        $dateAvailable = $dateReason === null;
        $timeAvailable = null;
        $reasons = [];

        if (isset($criteria['time'])) {
            $timeAvailable = $dateAvailable
                && (! $startsAt || ! $endsAt
                    || substr($criteria['time'], 0, 5) >= substr((string) $startsAt, 0, 5)
                    && substr($criteria['time'], 0, 5) < substr((string) $endsAt, 0, 5));
            if ($dateAvailable && ! $timeAvailable) {
                $reasons[] = 'Outside working hours for your selected time';
            }
        }

        if ($dateReason !== null) {
            $reasons[] = $dateReason;
        }

        return [
            'date' => $criteria['date'],
            'time' => $criteria['time'] ?? null,
            'is_available' => $dateAvailable && ($timeAvailable ?? true),
            'date_available' => $dateAvailable,
            'time_available' => $timeAvailable,
            'starts_at' => $startsAt ? substr((string) $startsAt, 0, 5) : null,
            'ends_at' => $endsAt ? substr((string) $endsAt, 0, 5) : null,
            'remaining_capacity' => $capacity === null ? null : max(0, $capacity - $bookedCount),
            'reasons' => $reasons,
        ];
    }

    private function matchesText(?string $actual, string $requested): bool
    {
        return $actual !== null
            && mb_strtolower(trim($actual)) === mb_strtolower(trim($requested));
    }
}
