const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const token = getToken();
  const config = {
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);
  const responseText = await response.text();
  let data = null;

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    throw {
      status: response.status,
      ...(data && typeof data === 'object' ? data : {}),
      message: data?.message || `Request failed with status ${response.status}.`,
    };
  }

  return data;
}

export const api = {
  register: (data) => request('/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (phone, role) => request('/login', { method: 'POST', body: JSON.stringify({ phone, role }) }),
  loginVerify: (phone, pin, role) => request('/login/verify', { method: 'POST', body: JSON.stringify({ phone, pin, role }) }),
  adminUsers: (filters = {}) => request(`/admin/users${Object.keys(filters).length ? `?${new URLSearchParams(filters)}` : ''}`),
  verifyButcher: (id, data) => request(`/admin/butchers/${encodeURIComponent(id)}/verification`, { method: 'PATCH', body: JSON.stringify(data) }),
  me: () => request('/me'),
  logout: () => request('/logout', { method: 'POST' }),
  butchers: (filters = {}) => request(`/butchers?${new URLSearchParams(filters)}`),
  butcher: (id) => request(`/butchers/${encodeURIComponent(id)}`),
  customerProfile: () => request('/customer/profile'),
  updateCustomerProfile: (data) => request('/customer/profile', { method: 'PUT', body: JSON.stringify(data) }),
  customerBookings: (filters = {}) => request(`/customer/bookings?${new URLSearchParams(filters)}`),
  customerBooking: (id) => request(`/customer/bookings/${encodeURIComponent(id)}`),
  createBooking: (data) => request('/customer/bookings', { method: 'POST', body: JSON.stringify(data) }),
  updateBookingStatus: (id, status, cancellationReason) => request(`/customer/bookings/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, cancellation_reason: cancellationReason }),
  }),
  customerReviews: () => request('/customer/reviews'),
  createReview: (bookingId, data) => request(`/customer/bookings/${encodeURIComponent(bookingId)}/reviews`, { method: 'POST', body: JSON.stringify(data) }),
  customerNotifications: () => request('/customer/notifications'),
  markNotificationRead: (id) => request(`/customer/notifications/${encodeURIComponent(id)}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => request('/customer/notifications/read-all', { method: 'PATCH' }),
  addresses: (data) => request('/customer/addresses', { method: 'POST', body: JSON.stringify(data) }),
  butcherProfile: () => request('/butcher/profile'),
  updateButcherProfile: (data) => request('/butcher/profile', { method: 'PUT', body: JSON.stringify(data) }),
  butcherServices: () => request('/butcher/services'),
  createButcherService: (data) => request('/butcher/services', { method: 'POST', body: JSON.stringify(data) }),
  updateButcherService: (id, data) => request(`/butcher/services/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteButcherService: (id) => request(`/butcher/services/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  butcherAvailability: () => request('/butcher/availability'),
  updateButcherAvailability: (data) => request('/butcher/availability', { method: 'PUT', body: JSON.stringify(data) }),
  butcherBookings: () => request('/butcher/bookings'),
  updateButcherBookingStatus: (id, status) => request(`/butcher/bookings/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  butcherReviews: () => request('/butcher/reviews'),
  createPayment: (bookingId, data) => request(`/customer/bookings/${encodeURIComponent(bookingId)}/payments`, { method: 'POST', body: JSON.stringify(data) }),
  customerConfirmPayment: (id) => request(`/customer/payments/${encodeURIComponent(id)}/confirm`, { method: 'POST' }),
  butcherConfirmPayment: (id) => request(`/butcher/payments/${encodeURIComponent(id)}/confirm`, { method: 'POST' }),
  confirmPayment: (id, role = 'customer') => request(`/${encodeURIComponent(role)}/payments/${encodeURIComponent(id)}/confirm`, { method: 'POST' }),
};

export function setToken(token) {
  localStorage.setItem('auth_token', token);
}

export function getToken() {
  return localStorage.getItem('auth_token');
}

export function clearToken() {
  localStorage.removeItem('auth_token');
}
