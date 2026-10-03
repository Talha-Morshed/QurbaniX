import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import { useAuth } from '../../auth/AuthContext';
import ButcherSidebar from '../../components/butcher/ButcherSidebar';
import BookingCapacity from '../../components/butcher/BookingCapacity';
import SpecialDates from '../../components/butcher/SpecialDates';
import WeeklySchedule from '../../components/butcher/WeeklySchedule';
import { availabilityFromApi, availabilityToApi } from '../../components/butcher/availabilityData';
import '../dashboard/ButcherDashboard.css';
import './Availability.css';

function errorMessage(error) {
  const validationMessage = Object.values(error?.errors || {}).flat()[0];
  return validationMessage || error?.message || 'Unable to load availability. Please try again.';
}

function validSchedule(schedule) {
  return schedule.every((item) => !item.enabled || (
    /^\d{2}:\d{2}$/.test(item.start)
    && /^\d{2}:\d{2}$/.test(item.end)
    && item.start < item.end
  ));
}

function Availability() {
  const { user } = useAuth();
  const [isAvailable, setIsAvailable] = useState(false);
  const [schedule, setSchedule] = useState([]);
  const [capacity, setCapacity] = useState(5);
  const [exceptions, setExceptions] = useState([]);
  const [dates, setDates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const applyAvailability = useCallback((data) => {
    const normalized = availabilityFromApi(data);
    setIsAvailable(normalized.isAvailable);
    setCapacity(normalized.capacity);
    setSchedule(normalized.schedule);
    setDates(normalized.dates);
    setExceptions(data.exceptions || []);
  }, []);

  const loadAvailability = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      applyAvailability(await api.butcherAvailability());
    } catch (loadError) {
      setError(errorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [applyAvailability]);

  useEffect(() => {
    if (user?.role !== 'butcher') {
      setError('A butcher account is required to manage availability.');
      setIsLoading(false);
      return;
    }

    loadAvailability();
  }, [loadAvailability, user?.role]);

  async function saveChanges() {
    if (!validSchedule(schedule)) {
      setError('Set a valid start and end time for each enabled day.');
      setSaved(false);
      return;
    }

    setIsSaving(true);
    setError('');
    setSaved(false);
    try {
      const payload = availabilityToApi({ isAvailable, capacity, schedule, exceptions });
      applyAvailability(await api.updateButcherAvailability(payload));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2800);
    } catch (saveError) {
      setError(errorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  }

  const initials = (user?.name || '').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  const enabledDays = schedule.filter((day) => day.enabled).length;

  return (
    <div className="butcher-dashboard availability-page">
      <ButcherSidebar />
      <main className="butcher-main">
        <header className="butcher-topbar availability-topbar"><div><p className="eyebrow">Butcher workspace</p><h1>Availability</h1><p>Manage your working days and hours so customers know when you are available.</p></div><div className="butcher-user"><span className="butcher-avatar">{initials}</span><div className="butcher-user-copy"><strong>{user?.name || 'Butcher account'}</strong><span>Butcher</span></div></div></header>
        <div className="availability-toolbar"><div><p className="eyebrow">Schedule management</p><h2>Working hours</h2></div><Link to="/dashboard/butcher" className="availability-dashboard-link">← Dashboard</Link></div>
        {isLoading ? <p className="availability-message" role="status">Loading your availability…</p> : error && schedule.length === 0 ? <p className="availability-error" role="alert">{error} <button type="button" onClick={loadAvailability}>Retry</button></p> : <>
          <section className={`butcher-panel availability-status-panel ${isAvailable ? 'is-available' : 'is-unavailable'}`}><div className="availability-status-copy"><span className="availability-status-icon"><i /></span><div><p className="eyebrow">Overall status</p><h2>{isAvailable ? 'Currently Available' : 'Currently Unavailable'}</h2><p>{isAvailable ? 'Customers can request bookings during your scheduled hours.' : 'New booking requests will not be accepted until you become available.'}</p></div></div><button type="button" className={`availability-main-toggle ${isAvailable ? 'is-on' : ''}`} onClick={() => setIsAvailable((current) => !current)} aria-pressed={isAvailable} disabled={isSaving}><span>{isAvailable ? 'Available' : 'Unavailable'}</span><i /></button></section>
          {error && <p className="availability-error" role="alert">{error}</p>}
          <div className="availability-layout" aria-busy={isSaving}>
            <div><WeeklySchedule schedule={schedule} onChange={setSchedule} disabled={isSaving} /><SpecialDates dates={dates} /></div>
            <div><BookingCapacity capacity={capacity} onChange={setCapacity} disabled={isSaving} /><section className="butcher-panel availability-summary"><p className="eyebrow">At a glance</p><h2>Customer visibility</h2><p>{isAvailable ? 'Customers can request bookings during your enabled scheduled hours.' : 'You are not currently accepting booking requests.'}</p><div className="summary-rule" /><div><span>Available days</span><strong>{enabledDays} of 7</strong></div><div><span>Daily capacity</span><strong>{capacity} bookings</strong></div></section></div>
          </div>
          <div className="availability-save-bar"><span>{saved ? 'Availability updated successfully.' : error || ''}</span><button type="button" className="availability-save" onClick={saveChanges} disabled={isSaving}>{isSaving ? 'Saving…' : 'Save Changes'}</button></div>
        </>}
      </main>
    </div>
  );
}

export default Availability;
