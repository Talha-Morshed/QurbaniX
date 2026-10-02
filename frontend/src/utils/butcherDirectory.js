const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function initialsFor(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0] || '').join('').toUpperCase();
}

function formatTime(value) {
  if (!value) return '';
  const [hours, minutes] = value.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${String(minutes).padStart(2, '0')} ${period}`;
}

function formatReviewDate(value) {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function mapDirectoryButcher(record) {
  const profile = record.butcher_profile || {};
  const services = record.services || [];
  const prices = services.map((service) => Number(service.price)).filter(Number.isFinite);
  const area = [profile.area, profile.city].filter(Boolean).join(', ');

  return {
    id: String(record.id),
    name: record.name || 'Butcher',
    initials: initialsFor(record.name),
    image: null,
    area: area || 'Location not provided',
    areaName: profile.area || '',
    city: profile.city || '',
    rating: Number(record.average_rating) || 0,
    reviews: Number(record.review_count) || 0,
    experience: profile.experience == null ? null : Number(profile.experience),
    animals: [...new Set(services.map((service) => service.animal).filter(Boolean))],
    services: [...new Set(services.map((service) => service.category).filter(Boolean))],
      startingPrice: prices.length ? Math.min(...prices) : null,
    availability: profile.is_available ? 'Available' : 'Unavailable',
    completedServices: Number(record.completed_services_count) || 0,
    verified: profile.verification_status === 'verified',
  };
}

export function getButcherFilterOptions(records) {
  const locations = new Map();
  const services = new Set();
  const animals = new Set();

  records.forEach((record) => {
    const profile = record.butcher_profile || {};
    if (profile.area || profile.city) {
      const value = JSON.stringify({ area: profile.area || '', city: profile.city || '' });
      locations.set(value, [profile.area, profile.city].filter(Boolean).join(', '));
    }
    (record.services || []).forEach((service) => {
      if (service.category) services.add(service.category);
      if (service.animal) animals.add(service.animal);
    });
  });

  return {
    locations: [...locations].map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label)),
    services: [...services].sort(),
    animals: [...animals].sort(),
  };
}

export function mapButcherDetailsResponse(response) {
  const record = response.butcher;
  const profile = record.butcher_profile || {};
  const reviewPage = response.reviews || {};
  const reviews = (reviewPage.data || []).map((review) => ({
    id: review.id,
    customer: review.customer?.name || 'Customer',
    rating: Number(review.rating) || 0,
    date: formatReviewDate(review.created_at),
    service: 'Qurbani service',
    text: review.comment || '',
    serviceRating: review.service_rating,
    professionalismRating: review.professionalism_rating,
    punctualityRating: review.punctuality_rating,
    cleanlinessRating: review.cleanliness_rating,
  }));
  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    percent: reviews.length
      ? Math.round(reviews.filter((review) => review.rating === stars).length / reviews.length * 100)
      : 0,
  }));
  const schedule = (record.availability_schedules || []).map((item) => {
    const start = formatTime(item.starts_at);
    const end = formatTime(item.ends_at);
    return [weekdays[item.weekday] || 'Day', start && end ? `${start} - ${end}` : 'Hours not listed'];
  });

  return {
    ...mapDirectoryButcher(record),
    bio: profile.bio || 'No profile description has been provided.',
    phone: record.phone || 'Not provided',
    specializations: Array.isArray(profile.specializations) ? profile.specializations : [],
    serviceAreas: Array.isArray(profile.service_areas) && profile.service_areas.length
      ? profile.service_areas
      : [profile.area, profile.city].filter(Boolean),
    schedule,
    services: (record.services || []).map((service) => ({
      id: String(service.id),
      name: service.name,
      animal: service.animal,
      description: service.description || service.category || 'Service details not provided.',
      price: Number(service.price) || 0,
      duration: service.duration || 'Not specified',
      availability: service.is_available ? 'Available' : 'Unavailable',
    })),
    reviews,
    reviewsCount: Number(record.review_count) || Number(reviewPage.total) || 0,
    completedServices: record.completed_services_count == null ? null : Number(record.completed_services_count),
    ratingDistribution,
  };
}