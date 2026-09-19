import { Icon } from '../../components/butcher/ButcherSidebar';
import ButcherSidebar from '../../components/butcher/ButcherSidebar';
import DashboardStats from '../../components/butcher/DashboardStats';
import BookingTable from '../../components/butcher/BookingTable';
import RecentActivity from '../../components/butcher/RecentActivity';
import AvailabilityCard from '../../components/butcher/AvailabilityCard';
import { activities, bookings, dashboardStats } from '../../components/butcher/butcherData';
import './ButcherDashboard.css';

function ButcherDashboard() {
  return (
    <div className="butcher-dashboard">
      <ButcherSidebar />
      <main className="butcher-main">
        <header className="butcher-topbar">
          <div><p className="eyebrow">Tuesday, 19 June 2025</p><h1>Good morning, Karim.</h1><p>Here&apos;s what&apos;s happening with your business today.</p></div>
          <div className="butcher-user"><button type="button" className="butcher-notification" aria-label="View notifications"><Icon name="inbox" size={18} /><span className="notification-dot" /></button><span className="butcher-avatar">KA</span><div className="butcher-user-copy"><strong>Karim Ahmed</strong><span>Verified Butcher</span></div></div>
        </header>
        <DashboardStats stats={dashboardStats} />
        <BookingTable bookings={bookings} />
        <div className="butcher-lower"><RecentActivity activities={activities} /><AvailabilityCard /></div>
      </main>
    </div>
  );
}

export default ButcherDashboard;
