import { Icon } from './ButcherSidebar';

function DetailGroup({ title, items }) {
  return <div className="booking-detail-group"><p className="eyebrow">{title}</p>{items.map(([label, value]) => <div className="booking-detail-row" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>;
}

function BookingDetails({ booking, onClose, onStatusChange, updatingBookingId, error }) {
  if (!booking) return null;
  const isUpdating = updatingBookingId === booking.id;
  return (
    <div className="booking-detail-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <aside className="booking-details" role="dialog" aria-modal="true" aria-labelledby="booking-details-title">
        <div className="booking-details-header"><div><p className="eyebrow">Booking details</p><h2 id="booking-details-title">{booking.reference}</h2></div><button type="button" className="booking-close" onClick={onClose} aria-label="Close booking details"><Icon name="close" size={20} /></button></div>
        <div className="booking-details-status"><span className={statusClass(booking.status)}>{booking.status}</span><span>Booked {booking.bookedOn}</span></div>
        <DetailGroup title="Customer information" items={[["Name", booking.customer], ["Phone", booking.phone], ["Location", booking.location]]} />
        <DetailGroup title="Service information" items={[["Animal", booking.animal], ["Service type", booking.service], ["Date", booking.date], ["Time", booking.time], ["Amount", booking.amount]]} />
        <DetailGroup title="Booking information" items={[["Booking reference", booking.reference], ["Booking ID", booking.id], ["Current status", booking.status], ["Created", booking.bookedOn]]} />
        {error && <p className="booking-action-error" role="alert">{error}</p>}
        <div className="booking-detail-actions"><button type="button" className="outline-action" onClick={onClose}>Close</button>{booking.status === 'Pending' && <><button type="button" className="detail-primary" disabled={updatingBookingId !== null} onClick={() => onStatusChange(booking.id, 'Confirmed')}>{isUpdating ? 'Saving...' : 'Accept booking'}</button><button type="button" className="detail-danger" disabled={updatingBookingId !== null} onClick={() => onStatusChange(booking.id, 'Cancelled')}>Reject</button></>}{booking.status === 'Confirmed' && <><button type="button" className="detail-primary" disabled={updatingBookingId !== null} onClick={() => onStatusChange(booking.id, 'In Progress')}>{isUpdating ? 'Saving...' : 'Start service'}</button><button type="button" className="detail-danger" disabled={updatingBookingId !== null} onClick={() => onStatusChange(booking.id, 'Cancelled')}>Cancel booking</button></>}{booking.status === 'In Progress' && <button type="button" className="detail-primary" disabled={updatingBookingId !== null} onClick={() => onStatusChange(booking.id, 'Completed')}>{isUpdating ? 'Saving...' : 'Mark completed'}</button>}</div>
      </aside>
    </div>
  );
}

function statusClass(status) {
  return `booking-status booking-status-${status.toLowerCase().replace(/\s+/g, '-')}`;
}

export default BookingDetails;