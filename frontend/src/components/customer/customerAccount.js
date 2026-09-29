import { getCustomerBookings } from './customerBookings';

const storageKey = 'qurbanix.customer.account.v1';
const mockBookings = getCustomerBookings();
const defaultBooking = mockBookings.find((booking) => booking.address);
const pendingBooking = mockBookings.find((booking) => booking.status === 'Pending') || defaultBooking;
const confirmedBooking = mockBookings.find((booking) => booking.status === 'Confirmed') || defaultBooking;
const completedBooking = mockBookings.find((booking) => booking.status === 'Completed') || defaultBooking;
const cancelledBooking = mockBookings.find((booking) => booking.status === 'Cancelled') || defaultBooking;

const defaultInbox = [
  { id: 'notification-booking-request', type: 'booking', title: 'Booking Request', message: `Your booking request has been sent to ${pendingBooking?.butcherName || 'your butcher'}.`, date: '2026-09-29T09:14:00', read: false, bookingId: pendingBooking?.id, action: 'booking' },
  { id: 'notification-booking-accepted', type: 'booking', title: 'Booking Accepted', message: `${confirmedBooking?.butcherName || 'Your butcher'} has accepted your booking.`, date: '2026-09-29T08:42:00', read: true, bookingId: confirmedBooking?.id, action: 'booking' },
  { id: 'notification-payment-received', type: 'payment', title: 'Advance Payment Received', message: 'Your advance payment was received successfully.', date: '2026-09-29T09:16:00', read: false, bookingId: pendingBooking?.id, action: 'booking' },
  { id: 'notification-service-reminder', type: 'service', title: 'Service Reminder', message: `${confirmedBooking?.butcherName || 'Your butcher'} is scheduled for tomorrow at 11:30 AM.`, date: '2026-09-29T07:30:00', read: true, bookingId: confirmedBooking?.id, action: 'booking' },
  { id: 'notification-service-completed', type: 'service', title: 'Service Completed', message: 'Your Qurbani service has been marked as completed.', date: '2026-09-18T15:10:00', read: true, bookingId: completedBooking?.id, action: 'booking' },
  { id: 'notification-review-reminder', type: 'review', title: 'Leave a Review', message: 'Share your experience by reviewing your butcher.', date: '2026-09-19T10:15:00', read: false, bookingId: completedBooking?.id, action: 'review' },
  { id: 'notification-booking-cancelled', type: 'booking', title: 'Booking Cancelled', message: `Your booking with ${cancelledBooking?.butcherName || 'the butcher'} has been cancelled.`, date: '2026-09-12T11:08:00', read: true, bookingId: cancelledBooking?.id, action: 'booking' },
  { id: 'notification-profile-updated', type: 'account', title: 'Profile Updated', message: 'Your profile information was updated successfully.', date: '2026-09-11T14:32:00', read: true, bookingId: null, action: 'profile' },
];

const defaultAccount = {
  profile: {
    id: 'customer-local',
    name: defaultBooking?.customerName || 'Amina Rahman',
    phone: defaultBooking?.phone || '01712345678',
    email: '',
    memberSince: 'June 2026',
    verified: false,
    avatar: '',
  },
  addresses: defaultBooking ? [{
    id: 'address-home',
    label: 'Home',
    address: defaultBooking.address,
    area: defaultBooking.area,
    city: defaultBooking.city,
    instructions: defaultBooking.instructions || '',
  }] : [{
    id: 'address-home',
    label: 'Home',
    address: 'House 18, Road 7',
    area: 'Dhanmondi',
    city: 'Dhaka',
    instructions: 'Please call on arrival.',
  }],
  notifications: {
    bookingUpdates: true,
    paymentUpdates: true,
    butcherMessages: true,
    reviewNotifications: true,
    promotions: false,
  },
};

function cloneAccount(account) {
  return JSON.parse(JSON.stringify(account));
}

export function getCustomerAccount() {
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.profile && Array.isArray(parsed.addresses) && parsed.notifications) return parsed;
    }
    window.localStorage.setItem(storageKey, JSON.stringify(defaultAccount));
  } catch {
    return cloneAccount(defaultAccount);
  }
  return cloneAccount(defaultAccount);
}

export function saveCustomerAccount(account) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(account));
  } catch {
    // Keep account settings usable for the current session when storage is unavailable.
  }
  return account;
}

export function getCustomerNotifications() {
  const account = getCustomerAccount();
  if (Array.isArray(account.inbox)) return account.inbox;
  saveCustomerAccount({ ...account, inbox: defaultInbox });
  return defaultInbox;
}

export function saveCustomerNotifications(inbox) {
  const account = getCustomerAccount();
  saveCustomerAccount({ ...account, inbox });
  window.dispatchEvent(new Event('customer-notifications-change'));
  return inbox;
}
