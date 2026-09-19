function statusClass(status) {
  return `booking-status booking-status-${status.toLowerCase()}`;
}

function BookingsTable({ bookings, onView, onAccept, onReject, onComplete }) {
  return (
    <div className="booking-list-wrap">
      <table className="bookings-list">
        <thead><tr><th>Booking</th><th>Customer</th><th>Service</th><th>Date &amp; time</th><th>Location</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>{bookings.map((booking) => <tr key={booking.id}>
          <td data-label="Booking"><strong>{booking.id}</strong><span>{booking.bookedOn}</span></td>
          <td data-label="Customer"><strong>{booking.customer}</strong><span>{booking.phone}</span></td>
          <td data-label="Service"><strong>{booking.animal}</strong><span>{booking.service}</span></td>
          <td data-label="Date & time"><strong>{booking.date}</strong><span>{booking.time}</span></td>
          <td data-label="Location">{booking.location}</td>
          <td data-label="Amount"><strong>{booking.amount}</strong></td>
          <td data-label="Status"><span className={statusClass(booking.status)}>{booking.status}</span></td>
          <td data-label="Actions"><div className="booking-actions"><button type="button" onClick={() => onView(booking)}>View</button>{booking.status === 'Pending' && <><button type="button" className="booking-accept" onClick={() => onAccept(booking.id)}>Accept</button><button type="button" className="booking-reject" onClick={() => onReject(booking.id)}>Reject</button></>}{booking.status === 'Accepted' && <button type="button" className="booking-accept" onClick={() => onComplete(booking.id)}>Complete</button>}</div></td>
        </tr>)}</tbody>
      </table>
      {!bookings.length && <div className="booking-empty"><strong>No bookings found</strong><span>Try a different status or search term.</span></div>}
    </div>
  );
}

export default BookingsTable;