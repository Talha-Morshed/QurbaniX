import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../components/butcher/ButcherSidebar';
import ButcherSidebar from '../../components/butcher/ButcherSidebar';
import BookingDetails from '../../components/butcher/BookingDetails';
import BookingFilters from '../../components/butcher/BookingFilters';
import BookingsTable from '../../components/butcher/BookingsTable';
import { butcherBookings } from '../../components/butcher/bookingsData';
import '../dashboard/ButcherDashboard.css';
import './Bookings.css';

function Bookings() {
  const [bookings, setBookings] = useState(butcherBookings);
  const [activeStatus, setActiveStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [date, setDate] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);

  const visibleBookings = useMemo(() => bookings.filter((booking) => {
    const matchesStatus = activeStatus === 'All' || booking.status === activeStatus;
    const normalizedSearch = search.trim().toLowerCase();
    const matchesSearch = !normalizedSearch || `${booking.id} ${booking.customer} ${booking.phone}`.toLowerCase().includes(normalizedSearch);
    const matchesDate = !date || booking.date === new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    return matchesStatus && matchesSearch && matchesDate;
  }), [activeStatus, bookings, date, search]);

  const updateStatus = (id, status) => {
    setBookings((current) => current.map((booking) => booking.id === id ? { ...booking, status } : booking));
    setSelectedBooking((current) => current?.id === id ? { ...current, status } : current);
  };

  return (
    <div className="butcher-dashboard bookings-page">
      <ButcherSidebar />
      <main className="butcher-main">
        <header className="butcher-topbar bookings-topbar"><div><p className="eyebrow">Butcher workspace</p><h1>Bookings</h1><p>Manage your Qurbani service requests and bookings.</p></div><div className="butcher-user"><button type="button" className="butcher-notification" aria-label="View notifications"><Icon name="inbox" size={18} /><span className="notification-dot" /></button><span className="butcher-avatar">KA</span><div className="butcher-user-copy"><strong>Karim Ahmed</strong><span>Verified Butcher</span></div></div></header>
        <div className="bookings-toolbar"><div><p className="eyebrow">Booking management</p><h2>All service requests <span>{visibleBookings.length}</span></h2></div><Link to="/dashboard/butcher" className="bookings-back">← Dashboard</Link></div>
        <BookingFilters activeStatus={activeStatus} onStatusChange={setActiveStatus} search={search} onSearchChange={setSearch} date={date} onDateChange={setDate} />
        <section className="butcher-panel bookings-list-panel"><BookingsTable bookings={visibleBookings} onView={setSelectedBooking} onAccept={(id) => updateStatus(id, 'Accepted')} onReject={(id) => updateStatus(id, 'Cancelled')} onComplete={(id) => updateStatus(id, 'Completed')} /></section>
      </main>
      <BookingDetails booking={selectedBooking} onClose={() => setSelectedBooking(null)} onAccept={(id) => updateStatus(id, 'Accepted')} onReject={(id) => updateStatus(id, 'Cancelled')} onComplete={(id) => updateStatus(id, 'Completed')} />
    </div>
  );
}

export default Bookings;