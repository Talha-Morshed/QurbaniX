import { butchers } from './butchersData';
import { butcherProfileDetails, getButcherServices } from './butcherProfileData';

const storageKey = 'qurbanix.customer.bookings.v1';

function buildMockBooking({ reference, butcherId, serviceId, date, time, status, createdDate, address, area, city, instructions }) {
  const butcher = butchers.find((item) => item.id === butcherId);
  const service = butcher && getButcherServices(butcher).find((item) => item.id === serviceId);
  if (!butcher || !service) return null;

  const price = service.price;
  const advance = Math.ceil(price * 0.2);
  const completed = status === 'Completed';
  const cancelled = status === 'Cancelled';
  return {
    id: reference,
    reference,
    butcherId,
    butcherName: butcher.name,
    butcherImage: butcher.image,
    butcherInitials: butcher.initials,
    butcherVerified: butcher.verified,
    butcherRating: butcher.rating,
    butcherLocation: butcher.area,
    butcherPhone: butcherProfileDetails[butcherId]?.phone || '',
    serviceId,
    serviceName: service.name,
    animal: service.animal,
    serviceDescription: service.description,
    date,
    time,
    createdDate,
    address,
    area,
    city,
    instructions,
    total: price,
    advancePaid: advance,
    remaining: completed ? 0 : price - advance,
    remainingPaymentMethod: 'Cash',
    status,
    paymentStatus: completed ? 'Paid in full' : cancelled ? 'Cancelled' : 'Advance paid',
    transactionReference: `QBX-TXN-${reference.slice(-4)}`,
    completedDate: completed ? date : '',
    cancellationMessage: cancelled ? 'The butcher was unable to accept this booking. No refund has been processed in this mock experience.' : '',
  };
}

const mockBookings = [
  buildMockBooking({ reference: 'QBX-2026-0001', butcherId: 'rashid-ali', serviceId: 'cow', date: '2026-10-04', time: '10:00', status: 'Pending', createdDate: '2026-09-29', address: 'House 18, Road 7', area: 'Dhanmondi', city: 'Dhaka', instructions: 'Please call on arrival.' }),
  buildMockBooking({ reference: 'QBX-2026-0002', butcherId: 'kamran-sheikh', serviceId: 'goat', date: '2026-09-30', time: '11:30', status: 'Confirmed', createdDate: '2026-09-25', address: 'Flat 4B, House 22', area: 'Gulshan', city: 'Dhaka', instructions: 'Use the north entrance.' }),
  buildMockBooking({ reference: 'QBX-2026-0003', butcherId: 'imran-hossain', serviceId: 'shared-cow', date: '2026-09-28', time: '09:30', status: 'In Progress', createdDate: '2026-09-20', address: 'House 6, Block C', area: 'Mirpur', city: 'Dhaka', instructions: 'Ask for the building caretaker.' }),
  buildMockBooking({ reference: 'QBX-2026-0004', butcherId: 'abdul-karim', serviceId: 'cow', date: '2026-09-18', time: '12:00', status: 'Completed', createdDate: '2026-09-10', address: 'House 11, Sector 4', area: 'Uttara', city: 'Dhaka', instructions: 'Please use the side gate.' }),
  buildMockBooking({ reference: 'QBX-2026-0005', butcherId: 'shafiq-uddin', serviceId: 'goat', date: '2026-09-12', time: '14:00', status: 'Cancelled', createdDate: '2026-09-05', address: 'House 3, Road 2', area: 'Mohammadpur', city: 'Dhaka', instructions: 'Call before arrival.' }),
].filter(Boolean);

function readStoredBookings() {
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Fall back to the local mock data when storage is unavailable or malformed.
  }
  return [...mockBookings];
}

function writeBookings(bookings) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(bookings));
  } catch {
    // Keep the current session usable when browser storage is unavailable.
  }
}

export function getCustomerBookings() {
  const stored = readStoredBookings();
  if (!window.localStorage.getItem(storageKey)) writeBookings(stored);
  return stored;
}

export function getCustomerBooking(id) {
  return getCustomerBookings().find((booking) => booking.id === id);
}

export function createCustomerBooking({ booking, butcher, service }) {
  const bookings = getCustomerBookings();
  const year = new Date().getFullYear();
  const sequence = bookings.reduce((highest, item) => {
    const match = item.reference?.match(/^QBX-\d{4}-(\d+)$/);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0) + 1;
  const reference = `QBX-${year}-${String(sequence).padStart(4, '0')}`;
  const createdDate = new Date().toISOString().slice(0, 10);
  const record = buildMockBooking({
    reference,
    butcherId: butcher.id,
    serviceId: service.id,
    date: booking.date,
    time: booking.time,
    status: 'Pending',
    createdDate,
    address: booking.address,
    area: booking.area,
    city: booking.city,
    instructions: booking.instructions,
  });
  const customerBooking = {
    ...record,
    customerName: booking.customerName,
    phone: booking.phone,
    total: service.price,
    advancePaid: Math.ceil(service.price * 0.2),
    remaining: service.price - Math.ceil(service.price * 0.2),
    transactionReference: `QBX-TXN-${String(sequence).padStart(4, '0')}`,
  };
  writeBookings([customerBooking, ...bookings]);
  return customerBooking;
}

export function getCustomerReviews() {
  return getCustomerBookings()
    .filter((booking) => booking.review)
    .map((booking) => ({ ...booking.review, booking }));
}

export function getCustomerReviewsForButcher(butcherId) {
  return getCustomerReviews().filter((review) => review.butcherId === butcherId);
}

export function saveCustomerReview(bookingId, review) {
  const bookings = getCustomerBookings();
  const bookingIndex = bookings.findIndex((booking) => booking.id === bookingId);
  const booking = bookings[bookingIndex];
  if (!booking || booking.status !== 'Completed') return null;

  const overallRating = Number(review.rating);
  const savedReview = {
    id: booking.review?.id || `review-${booking.id}`,
    bookingId: booking.id,
    reference: booking.reference,
    butcherId: booking.butcherId,
    butcherName: booking.butcherName,
    customerName: booking.customerName || 'Customer',
    rating: overallRating,
    serviceRating: Number(review.serviceRating) || overallRating,
    professionalismRating: Number(review.professionalismRating) || overallRating,
    punctualityRating: Number(review.punctualityRating) || overallRating,
    cleanlinessRating: Number(review.cleanlinessRating) || overallRating,
    service: booking.serviceName,
    comment: review.comment.trim(),
    recommended: review.recommended || '',
    date: booking.review?.date || new Date().toLocaleDateString('en-BD', { day: 'numeric', month: 'long', year: 'numeric' }),
    status: booking.review?.status || 'Published',
  };

  bookings[bookingIndex] = { ...booking, review: savedReview };
  writeBookings(bookings);
  return savedReview;
}