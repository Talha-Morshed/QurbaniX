function statusClass(status) {
  return `booking-status booking-status-${status.toLowerCase().replace(/\s+/g, '-')}`;
}

function BookingsTable({ bookings, hasBookings, onView, onStatusChange, updatingBookingId, isLoading, error, onRetry }) {
  return (
    <div className="booking-list-wrap">
      <table className="bookings-list">
        <thead><tr><th>Booking</th><th>Customer</th><th>Service</th><th>Date &amp; time</th><th>Location</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>{bookings.map((booking) => <tr key={booking.id}>
          <td data-label="Booking"><strong>{booking.reference}</strong><span>{booking.bookedOn}</span></td>
          <td data-label="Customer"><strong>{booking.customer}</strong><span>{booking.phone}</span></td>
          <td data-label="Service"><strong>{booking.animal}</strong><span>{booking.service}</span></td>
          <td data-label="Date & time"><strong>{booking.date}</strong><span>{booking.time}</span></td>
          <td data-label="Location">{booking.location}</td>
          <td data-label="Amount"><strong>{booking.amount}</strong></td>
          <td data-label="Status"><span className={statusClass(booking.status)}>{booking.status}</span></td>
          <td data-label="Actions"><div className="booking-actions"><button type="button" onClick={() => onView(booking)}>View</button>{booking.status === 'Pending' && <><button type="button" className="booking-accept" disabled={updatingBookingId !== null} onClick={() => onStatusChange(booking.id, 'Confirmed')}>{updatingBookingId === booking.id ? 'Saving...' : 'Accept'}</button><button type="button" className="booking-reject" disabled={updatingBookingId !== null} onClick={() => onStatusChange(booking.id, 'Cancelled')}>Reject</button></>}{booking.status === 'Confirmed' && <><button type="button" className="booking-accept" disabled={updatingBookingId !== null} onClick={() => onStatusChange(booking.id, 'In Progress')}>{updatingBookingId === booking.id ? 'Saving...' : 'Start'}</button><button type="button" className="booking-reject" disabled={updatingBookingId !== null} onClick={() => onStatusChange(booking.id, 'Cancelled')}>Cancel</button></>}{booking.status === 'In Progress' && <button type="button" className="booking-accept" disabled={updatingBookingId !== null} onClick={() => onStatusChange(booking.id, 'Completed')}>{updatingBookingId === booking.id ? 'Saving...' : 'Complete'}</button>}</div></td>
        </tr>)}</tbody>
      </table>
      {isLoading && <div className="booking-empty" role="status"><strong>Loading bookings...</strong></div>}
      {!isLoading && error && <div className="booking-empty" role="alert"><strong>Unable to load bookings</strong><span>{error}</span><button type="button" className="booking-retry" onClick={onRetry}>Try again</button></div>}
      {!isLoading && !error && !bookings.length && <div className="booking-empty"><strong>{hasBookings ? 'No bookings match these filters' : 'No bookings yet'}</strong><span>{hasBookings ? 'Try a different status, search term, or date.' : 'New customer booking requests will appear here.'}</span></div>}
    </div>
  );
}

export default BookingsTable;