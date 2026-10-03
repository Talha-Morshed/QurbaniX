import { Link } from 'react-router-dom';

function AvailabilityCard({ isAvailable, hours }) {
  return (
    <section className="butcher-panel availability-panel" id="availability">
      <div className="availability-top"><div><p className="eyebrow">Service status</p><h2>Availability</h2></div><span className={`availability-dot ${isAvailable ? 'is-on' : ''}`} /></div>
      <div className="availability-status"><div><strong>{isAvailable ? 'Currently available' : 'Currently unavailable'}</strong><p>{isAvailable ? 'Customers can request your services.' : 'New requests are paused for now.'}</p></div><span className={`availability-toggle ${isAvailable ? 'is-on' : ''}`} aria-hidden="true"><span /></span></div>
      <div className="availability-rule" />
      <div className="availability-hours"><span>Today&apos;s hours</span><strong>{hours}</strong></div>
      <Link to="/dashboard/butcher/availability" className="outline-action">Manage availability <span aria-hidden="true">→</span></Link>
    </section>
  );
}

export default AvailabilityCard;