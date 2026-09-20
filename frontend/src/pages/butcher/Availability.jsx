import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../components/butcher/ButcherSidebar';
import ButcherSidebar from '../../components/butcher/ButcherSidebar';
import BookingCapacity from '../../components/butcher/BookingCapacity';
import SpecialDates from '../../components/butcher/SpecialDates';
import WeeklySchedule from '../../components/butcher/WeeklySchedule';
import { initialSchedule, initialSpecialDates } from '../../components/butcher/availabilityData';
import '../dashboard/ButcherDashboard.css';
import './Availability.css';

function Availability() {
  const [isAvailable, setIsAvailable] = useState(true);
  const [schedule, setSchedule] = useState(initialSchedule);
  const [capacity, setCapacity] = useState(5);
  const [saved, setSaved] = useState(false);

  const saveChanges = () => { setSaved(true); window.setTimeout(() => setSaved(false), 2800); };

  return (
    <div className="butcher-dashboard availability-page">
      <ButcherSidebar />
      <main className="butcher-main">
        <header className="butcher-topbar availability-topbar"><div><p className="eyebrow">Butcher workspace</p><h1>Availability</h1><p>Manage your working days and hours so customers know when you are available.</p></div><div className="butcher-user"><button type="button" className="butcher-notification" aria-label="View notifications"><Icon name="inbox" size={18} /><span className="notification-dot" /></button><span className="butcher-avatar">KA</span><div className="butcher-user-copy"><strong>Karim Ahmed</strong><span>Verified Butcher</span></div></div></header>
        <div className="availability-toolbar"><div><p className="eyebrow">Schedule management</p><h2>Working hours</h2></div><Link to="/dashboard/butcher" className="availability-dashboard-link">← Dashboard</Link></div>
        <section className={`butcher-panel availability-status-panel ${isAvailable ? 'is-available' : 'is-unavailable'}`}><div className="availability-status-copy"><span className="availability-status-icon"><i /></span><div><p className="eyebrow">Overall status</p><h2>{isAvailable ? 'Currently Available' : 'Currently Unavailable'}</h2><p>{isAvailable ? 'Customers can request bookings during your scheduled hours.' : 'New booking requests will not be accepted until you become available.'}</p></div></div><button type="button" className={`availability-main-toggle ${isAvailable ? 'is-on' : ''}`} onClick={() => setIsAvailable((current) => !current)} aria-pressed={isAvailable}><span>{isAvailable ? 'Available' : 'Unavailable'}</span><i /></button></section>
        <div className="availability-layout"><div><WeeklySchedule schedule={schedule} onChange={setSchedule} /><SpecialDates dates={initialSpecialDates} /></div><div><BookingCapacity capacity={capacity} scheduled={3} onChange={setCapacity} /><section className="butcher-panel availability-summary"><p className="eyebrow">At a glance</p><h2>Customer visibility</h2><p>Your next available window is <strong>Saturday, 9:00 AM</strong>.</p><div className="summary-rule" /><div><span>Available days</span><strong>{schedule.filter((day) => day.enabled).length} of 7</strong></div><div><span>Daily capacity</span><strong>{capacity} bookings</strong></div></section></div></div>
        <div className="availability-save-bar"><span>{saved ? 'Availability updated successfully.' : 'Changes are saved for this session only.'}</span><button type="button" className="availability-save" onClick={saveChanges}>Save Changes</button></div>
      </main>
    </div>
  );
}

export default Availability;