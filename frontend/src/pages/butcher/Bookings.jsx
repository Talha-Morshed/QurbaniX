import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import { Icon } from '../../components/butcher/ButcherSidebar';
import ButcherSidebar from '../../components/butcher/ButcherSidebar';
import BookingDetails from '../../components/butcher/BookingDetails';
import BookingFilters from '../../components/butcher/BookingFilters';
import BookingsTable from '../../components/butcher/BookingsTable';
import '../dashboard/ButcherDashboard.css';
import './Bookings.css';

function formatDate(date) {
  if (!date) return '—';
  const parsed = new Date(`${date}T00:00:00`);
  return Number.isNaN(parsed.getTime())
    ? '—'
    : parsed.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function formatTime(time) {
  if (!time) return '—';
  const [hours, minutes] = time.split(':');
  const parsed = new Date();
  parsed.setHours(Number(hours), Number(minutes), 0, 0);
  return parsed.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function formatMoney(amount) {
  return `৳${Number(amount || 0).toLocaleString('en-BD')}`;
}

function mapBooking(record) {
  const service = record.service || {};
  return {
    id: record.id,
    reference: record.reference,
    customer: record.customer?.name || 'Customer',
    phone: record.customer?.phone || '—',
    service: service.name || 'Service',
    animal: service.animal || '—',
    date: formatDate(record.service_date),
    serviceDate: record.service_date,
    time: formatTime(record.service_time),
    location: [record.address, record.area, record.city].filter(Boolean).join(', ') || '—',
    amount: formatMoney(record.total_amount),
    status: record.status,
    bookedOn: formatDate(record.created_at?.slice(0, 10)),
  };
}

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [statusError, setStatusError] = useState('');
  const [updatingBookingId, setUpdatingBookingId] = useState(null);
  const [activeStatus, setActiveStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [date, setDate] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);

  const loadBookings = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const records = [];
      let page = 1;
      let lastPage = 1;
      do {
        const response = await api.butcherBookings({ per_page: 100, page });
        records.push(...(response.data || []));
        lastPage = response.last_page || 1;
        page += 1;
      } while (page <= lastPage);
      setBookings(records.map(mapBooking));
    } catch (error) {
      setLoadError(error.message || 'Unable to load bookings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const visibleBookings = useMemo(() => bookings.filter((booking) => {
    const matchesStatus = activeStatus === 'All' || booking.status === activeStatus;
    const normalizedSearch = search.trim().toLowerCase();
    const matchesSearch = !normalizedSearch || `${booking.reference} ${booking.customer} ${booking.phone}`.toLowerCase().includes(normalizedSearch);
    const matchesDate = !date || booking.serviceDate === date;
    return matchesStatus && matchesSearch && matchesDate;
  }), [activeStatus, bookings, date, search]);

  const updateStatus = async (id, status) => {
    if (updatingBookingId !== null) return;
    setUpdatingBookingId(id);
    setStatusError('');
    try {
      const response = await api.updateButcherBookingStatus(id, status);
      const updatedBooking = mapBooking(response.booking);
      setBookings((current) => current.map((booking) => booking.id === id ? updatedBooking : booking));
      setSelectedBooking((current) => current?.id === id ? updatedBooking : current);
    } catch (error) {
      setStatusError(error.message || 'Unable to update booking status.');
    } finally {
      setUpdatingBookingId(null);
    }
  };

  return (
    <div className="butcher-dashboard bookings-page">
      <ButcherSidebar />
      <main className="butcher-main">
        <header className="butcher-topbar bookings-topbar"><div><p className="eyebrow">Butcher workspace</p><h1>Bookings</h1><p>Manage your Qurbani service requests and bookings.</p></div><div className="butcher-user"><button type="button" className="butcher-notification" aria-label="View notifications"><Icon name="inbox" size={18} /><span className="notification-dot" /></button><span className="butcher-avatar">KA</span><div className="butcher-user-copy"><strong>Karim Ahmed</strong><span>Verified Butcher</span></div></div></header>
        <div className="bookings-toolbar"><div><p className="eyebrow">Booking management</p><h2>All service requests <span>{visibleBookings.length}</span></h2></div><Link to="/dashboard/butcher" className="bookings-back">← Dashboard</Link></div>
        <BookingFilters activeStatus={activeStatus} onStatusChange={setActiveStatus} search={search} onSearchChange={setSearch} date={date} onDateChange={setDate} />
        {statusError && <p className="booking-action-error" role="alert">{statusError}</p>}
        <section className="butcher-panel bookings-list-panel"><BookingsTable bookings={visibleBookings} hasBookings={bookings.length > 0} onView={setSelectedBooking} onStatusChange={updateStatus} updatingBookingId={updatingBookingId} isLoading={isLoading} error={loadError} onRetry={loadBookings} /></section>
      </main>
      <BookingDetails booking={selectedBooking} onClose={() => setSelectedBooking(null)} onStatusChange={updateStatus} updatingBookingId={updatingBookingId} error={statusError} />
    </div>
  );
}

export default Bookings;
