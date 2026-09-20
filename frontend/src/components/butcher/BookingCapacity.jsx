function BookingCapacity({ capacity, scheduled, onChange }) {
  return (
    <section className="butcher-panel booking-capacity"><div className="panel-heading"><div><p className="eyebrow">Daily limit</p><h2>Booking capacity</h2></div></div><div className="capacity-content"><label>Maximum bookings per day<input type="number" min="1" max="99" value={capacity} onChange={(event) => onChange(Math.max(1, Number(event.target.value) || 1))} /></label><div className="capacity-progress"><div className="capacity-progress-label"><span>Bookings scheduled today</span><strong>{scheduled} / {capacity}</strong></div><div className="capacity-track"><span style={{ width: `${Math.min((scheduled / capacity) * 100, 100)}%` }} /></div><p>You can accept {Math.max(capacity - scheduled, 0)} more bookings today.</p></div></div></section>
  );
}

export default BookingCapacity;