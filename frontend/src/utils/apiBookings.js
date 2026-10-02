function initialsFor(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0] || '').join('').toUpperCase();
}

function dateOnly(value) {
  return value ? String(value).slice(0, 10) : '';
}

export function mapApiBooking(record) {
  const butcher = record.butcher || {};
  const profile = butcher.butcher_profile || {};
  const service = record.service || {};
  const payments = record.payments || [];
  const location = [profile.area, profile.city].filter(Boolean).join(', ');
  const advancePaid = payments
    .filter((payment) => payment.purpose === 'advance' && payment.status === 'paid')
    .reduce((total, payment) => total + Number(payment.amount || 0), 0);

  return {
    id: String(record.id),
    reference: record.reference,
    butcherId: String(record.butcher_id),
    butcherName: butcher.name || 'Butcher',
    butcherImage: null,
    butcherInitials: initialsFor(butcher.name),
    butcherVerified: profile.verification_status === 'verified',
    butcherRating: Number(butcher.average_rating) || 0,
    butcherLocation: location || 'Location not provided',
    butcherPhone: butcher.phone || '',
    serviceId: String(record.service_id),
    serviceName: service.name || 'Service',
    animal: service.animal || 'Not specified',
    serviceDescription: service.description || service.category || '',
    date: dateOnly(record.service_date),
    time: record.service_time || '',
    createdDate: dateOnly(record.created_at),
    completedDate: dateOnly(record.completed_at),
    address: record.address || '',
    area: record.area || '',
    city: record.city || '',
    instructions: record.instructions || '',
    total: Number(record.total_amount) || 0,
    advanceAmount: Number(record.advance_amount) || 0,
    advancePaid,
    remaining: Number(record.remaining_amount) || 0,
    remainingPaymentMethod: 'Not specified',
    status: record.status,
    paymentStatus: record.payment_status || 'Unpaid',
    cancellationMessage: record.cancellation_reason || '',
    review: record.review || null,
    transactionReference: payments.find((payment) => payment.provider_reference)?.provider_reference || '',
  };
}