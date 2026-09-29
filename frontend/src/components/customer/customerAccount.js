import { getCustomerBookings } from './customerBookings';

const storageKey = 'qurbanix.customer.account.v1';
const defaultBooking = getCustomerBookings().find((booking) => booking.address);

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
