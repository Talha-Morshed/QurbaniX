import { useState } from 'react';

function AvailabilityCard() {
  const [isAvailable, setIsAvailable] = useState(true);
  return (
    <section className="butcher-panel availability-panel" id="availability">
      <div className="availability-top"><div><p className="eyebrow">Service status</p><h2>Availability</h2></div><span className={`availability-dot ${isAvailable ? 'is-on' : ''}`} /></div>
      <div className="availability-status"><div><strong>{isAvailable ? 'Currently available' : 'Currently unavailable'}</strong><p>{isAvailable ? 'Customers can request your services.' : 'New requests are paused for now.'}</p></div><button type="button" className={`availability-toggle ${isAvailable ? 'is-on' : ''}`} onClick={() => setIsAvailable((current) => !current)} aria-pressed={isAvailable}><span /></button></div>
      <div className="availability-rule" />
      <div className="availability-hours"><span>Today&apos;s hours</span><strong>8:00 AM – 8:00 PM</strong></div>
      <button type="button" className="outline-action">Manage availability <span aria-hidden="true">→</span></button>
    </section>
  );
}

export default AvailabilityCard;