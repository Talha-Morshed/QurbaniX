function statusClass(status) {
  return `booking-status booking-status-${status.toLowerCase()}`;
}

function BookingTable({ bookings }) {
  return (
    <section className="butcher-panel bookings-panel" id="bookings">
      <div className="panel-heading">
        <div><p className="eyebrow">Manage your schedule</p><h2>Today&apos;s bookings</h2></div>
        <button type="button" className="text-action">View all <span aria-hidden="true">→</span></button>
      </div>
      <div className="booking-table-wrap">
        <table className="booking-table">
          <thead><tr><th>Customer</th><th>Service</th><th>Date &amp; time</th><th>Location</th><th>Amount</th><th>Status</th><th><span className="sr-only">Action</span></th></tr></thead>
          <tbody>{bookings.map((booking) => <tr key={booking.id}>
            <td><strong>{booking.customer}</strong><span>{booking.id}</span></td>
            <td>{booking.service}</td>
            <td><strong>{booking.date}</strong><span>{booking.time}</span></td>
            <td>{booking.location}</td>
            <td><strong>{booking.amount}</strong></td>
            <td><span className={statusClass(booking.status)}>{booking.status}</span></td>
            <td><button type="button" className="row-action" aria-label={`Open booking ${booking.id}`}>•••</button></td>
          </tr>)}</tbody>
        </table>
      </div>
    </section>
  );
}

export default BookingTable;