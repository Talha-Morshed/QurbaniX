import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import { useAuth } from '../../auth/AuthContext';
import { Icon } from '../../components/butcher/ButcherSidebar';
import ButcherSidebar from '../../components/butcher/ButcherSidebar';
import DashboardStats from '../../components/butcher/DashboardStats';
import BookingTable from '../../components/butcher/BookingTable';
import RecentActivity from '../../components/butcher/RecentActivity';
import AvailabilityCard from '../../components/butcher/AvailabilityCard';
import './ButcherDashboard.css';

async function fetchAllPages(fetchPage) {
  const records = [];
  let page = 1;
  let lastPage = 1;

  do {
    const response = await fetchPage({ per_page: 100, page });
    records.push(...(response.data || []));
    lastPage = response.last_page || 1;
    page += 1;
  } while (page <= lastPage);

  return records;
}

function formatMoney(amount) {
  return `৳${Number(amount || 0).toLocaleString('en-BD')}`;
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(value) {
  if (!value) return '—';
  const [hours, minutes] = String(value).split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString('en-BD', { hour: 'numeric', minute: '2-digit' });
}

function formatDateTime(value) {
  const timestamp = Date.parse(value || '');
  return Number.isNaN(timestamp)
    ? 'Date unavailable'
    : new Date(timestamp).toLocaleString('en-BD', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
}

function initials(name) {
  return String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

function makeStats(bookings) {
  const countStatus = (status) => bookings.filter((booking) => booking.status === status).length;
  const payments = bookings.flatMap((booking) => booking.payments || []);
  const paidPayments = payments.filter((payment) => payment.status === 'paid');
  const totalEarnings = paidPayments.reduce((total, payment) => total + Number(payment.amount || 0), 0);

  return [
    { label: 'Total bookings', value: String(bookings.length), change: 'All booking requests', tone: 'green' },
    { label: 'Pending requests', value: String(countStatus('Pending')), change: `${countStatus('Pending')} awaiting your response`, tone: 'gold' },
    { label: 'Completed services', value: String(countStatus('Completed')), change: 'Completed bookings', tone: 'blue' },
    { label: 'Total earnings', value: formatMoney(totalEarnings), change: paidPayments.length ? `${paidPayments.length} paid payments` : 'No paid payments yet', tone: 'dark' },
  ];
}

function makeActivities(bookings, reviews) {
  const bookingActivities = bookings.map((booking) => {
    const serviceName = booking.service?.name || 'Service';
    const customerName = booking.customer?.name || 'Customer';
    const status = booking.status || 'Updated';
    return {
      title: status === 'Pending' ? 'New booking request' : `Booking ${status.toLowerCase()}`,
      detail: `${booking.reference || `Booking #${booking.id}`} · ${serviceName} for ${customerName}`,
      time: formatDateTime(booking.updated_at || booking.created_at),
      timestamp: Date.parse(booking.updated_at || booking.created_at || '') || 0,
      icon: status === 'Completed' ? 'scissors' : 'inbox',
    };
  });
  const paymentActivities = bookings.flatMap((booking) => (booking.payments || []).map((payment) => ({
    title: payment.status === 'paid' ? 'Payment received' : `Payment ${payment.status || 'updated'}`,
    detail: `${formatMoney(payment.amount)} · ${payment.purpose || 'payment'} · ${booking.reference || `Booking #${booking.id}`}`,
    time: formatDateTime(payment.updated_at || payment.created_at),
    timestamp: Date.parse(payment.updated_at || payment.created_at || '') || 0,
    icon: 'payment',
  })));
  const reviewActivities = reviews.map((review) => ({
    title: 'Customer left a review',
    detail: `${review.customer?.name || 'Customer'} · ${Number(review.rating) || 0}/5 stars`,
    time: formatDateTime(review.created_at),
    timestamp: Date.parse(review.created_at || '') || 0,
    icon: 'star',
  }));

  return [...bookingActivities, ...paymentActivities, ...reviewActivities]
    .sort((first, second) => second.timestamp - first.timestamp)
    .slice(0, 5);
}

function todayHours(availability) {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const exception = (availability.exceptions || []).find((item) => String(item.date).slice(0, 10) === today);

  if (exception) {
    if (!exception.is_available) return 'Unavailable today';
    return exception.starts_at && exception.ends_at
      ? `${formatTime(exception.starts_at)} – ${formatTime(exception.ends_at)}`
      : 'Available today';
  }

  const schedule = (availability.schedule || []).find((item) => Number(item.weekday) === now.getDay());
  if (!schedule?.is_enabled) return 'No hours set';
  return schedule.starts_at && schedule.ends_at
    ? `${formatTime(schedule.starts_at)} – ${formatTime(schedule.ends_at)}`
    : 'Hours not set';
}

function ButcherDashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  const loadDashboard = useCallback(async () => {
    if (user?.role !== 'butcher') {
      setError('A butcher account is required to view this dashboard.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const [profileResponse, bookings, reviews, availability] = await Promise.all([
        api.butcherProfile(),
        fetchAllPages((filters) => api.butcherBookings(filters)),
        fetchAllPages((filters) => api.butcherReviews(filters)),
        api.butcherAvailability(),
      ]);
      setDashboard({
        profile: profileResponse.profile,
        bookings,
        reviews,
        availability,
      });
    } catch (requestError) {
      setDashboard(null);
      setError(requestError?.status >= 500
        ? 'Unable to load your dashboard right now. Please try again.'
        : requestError?.message || 'Unable to load your dashboard. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard, retryKey]);

  const name = dashboard?.profile?.user?.name || user?.name || '';
  const verificationStatus = dashboard?.profile?.verification_status;
  const bookings = dashboard?.bookings || [];
  const reviews = dashboard?.reviews || [];
  const recentBookings = [...bookings]
    .sort((first, second) => Date.parse(second.created_at || '') - Date.parse(first.created_at || ''))
    .slice(0, 5)
    .map((booking) => ({
      id: booking.id,
      reference: booking.reference || `Booking #${booking.id}`,
      customer: booking.customer?.name || 'Customer',
      service: booking.service?.name || 'Service',
      date: formatDate(booking.service_date),
      time: formatTime(booking.service_time),
      location: [booking.area, booking.city].filter(Boolean).join(', ') || '—',
      amount: formatMoney(booking.total_amount),
      status: booking.status || 'Unknown',
    }));
  const stats = dashboard ? makeStats(bookings) : [];
  const activities = dashboard ? makeActivities(bookings, reviews) : [];

  return (
    <div className="butcher-dashboard">
      <ButcherSidebar />
      <main className="butcher-main">
        <header className="butcher-topbar">
          <div><p className="eyebrow">{new Date().toLocaleDateString('en-BD', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p><h1>{name ? `Welcome, ${name}.` : 'Butcher dashboard'}</h1><p>Here&apos;s what&apos;s happening with your business.</p></div>
          <div className="butcher-user"><span className="butcher-avatar">{initials(name) || <Icon name="user" size={18} />}</span><div className="butcher-user-copy"><strong>{name || 'Butcher account'}</strong><span>{verificationStatus ? `${verificationStatus[0].toUpperCase()}${verificationStatus.slice(1)} butcher` : 'Butcher account'}</span></div></div>
        </header>
        {isLoading ? <p className="butcher-dashboard-message" role="status">Loading your butcher dashboard...</p> : error ? (
          <div className="butcher-dashboard-message" role="alert"><p>{error}</p><button type="button" className="outline-action" onClick={() => setRetryKey((current) => current + 1)}>Try again</button></div>
        ) : dashboard ? (
          <>
            <DashboardStats stats={stats} />
            <BookingTable bookings={recentBookings} />
            <div className="butcher-lower"><RecentActivity activities={activities} reviewCount={reviews.length} /><AvailabilityCard isAvailable={Boolean(dashboard.availability.is_available)} hours={todayHours(dashboard.availability)} /></div>
          </>
        ) : null}
      </main>
    </div>
  );
}

export default ButcherDashboard;
