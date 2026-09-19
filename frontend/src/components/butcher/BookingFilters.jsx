const statusFilters = ['All', 'Pending', 'Accepted', 'Completed', 'Cancelled'];

function BookingFilters({ activeStatus, onStatusChange, search, onSearchChange, date, onDateChange }) {
  return (
    <section className="booking-filters" aria-label="Filter bookings">
      <div className="booking-filter-tabs" role="tablist" aria-label="Booking status">
        {statusFilters.map((status) => (
          <button key={status} type="button" role="tab" aria-selected={activeStatus === status} className={activeStatus === status ? 'is-active' : ''} onClick={() => onStatusChange(status)}>{status}</button>
        ))}
      </div>
      <div className="booking-filter-fields">
        <label className="booking-search"><span className="sr-only">Search bookings</span><span aria-hidden="true">⌕</span><input type="search" value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search booking or customer" /></label>
        <label className="booking-date"><span className="sr-only">Filter by date</span><input type="date" value={date} onChange={(event) => onDateChange(event.target.value)} /></label>
      </div>
    </section>
  );
}

export default BookingFilters;