import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCustomerBooking, getCustomerBookings } from '../../components/customer/customerBookings';
import { CustomerNavigation, VerifiedMark } from './FindButchers';
import './CustomerBookings.css';

const filters = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'];
const progressLabels = ['Booking Requested', 'Butcher Accepted', 'Service Scheduled', 'Service Completed', 'Payment Completed'];

function formatDate(date) {
  if (!date) return 'Not set';
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-BD', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatTime(time) {
  if (!time) return 'Not set';
  const [hour, minute] = time.split(':').map(Number);
  return new Date(2000, 0, 1, hour, minute).toLocaleTimeString('en-BD', { hour: 'numeric', minute: '2-digit' });
}

function money(amount) {
  return `৳${Number(amount || 0).toLocaleString('en-BD')}`;
}

function statusClass(status) {
  return `customer-booking-status status-${status.toLowerCase().replaceAll(' ', '-')}`;
}

function BookingHistory() {
  const [activeFilter, setActiveFilter] = useState('All');
  const bookings = useMemo(() => getCustomerBookings(), []);
  const visibleBookings = bookings
    .filter((booking) => activeFilter === 'All' || booking.status === activeFilter)
    .sort((first, second) => second.createdDate.localeCompare(first.createdDate));

  return (
    <div className="find-butcher-page customer-bookings-page">
      <CustomerNavigation />
      <main className="customer-bookings-main">
        <Link className="details-back-link" to="/dashboard/customer">← Customer home</Link>
        <header className="customer-bookings-heading">
          <div><p className="finder-eyebrow">Customer account · Bookings</p><h1>Booking History</h1><p>Review your service bookings, payment status, and next steps.</p></div>
          <Link className="booking-primary-button" to="/dashboard/customer/find-butcher">Find a butcher</Link>
        </header>
        <div className="customer-booking-filters" role="tablist" aria-label="Filter bookings by status">
          {filters.map((filter) => (
            <button type="button" role="tab" aria-selected={activeFilter === filter} className={activeFilter === filter ? 'is-active' : ''} key={filter} onClick={() => setActiveFilter(filter)}>{filter}</button>
          ))}
        </div>
        <section className="customer-booking-list" aria-live="polite">
          {visibleBookings.map((booking) => (
            <article className="customer-booking-card" key={booking.id}>
              <div className="customer-booking-card-top">
                <div><p className="customer-booking-reference">{booking.reference}</p><h2>{booking.butcherName}</h2></div>
                <span className={statusClass(booking.status)}>{booking.status}</span>
              </div>
              <div className="customer-booking-card-details">
                <div><span>Service</span><strong>{booking.serviceName}</strong></div>
                <div><span>Animal</span><strong>{booking.animal}</strong></div>
                <div><span>Date &amp; time</span><strong>{formatDate(booking.date)} · {formatTime(booking.time)}</strong></div>
                <div><span>Location</span><strong>{booking.area}, {booking.city}</strong></div>
                <div><span>Total / advance</span><strong>{money(booking.total)} / {money(booking.advancePaid)}</strong></div>
                <div><span>Remaining / payment</span><strong>{money(booking.remaining)} · {booking.paymentStatus}</strong></div>
              </div>
              <div className="customer-booking-card-footer"><span>Payment: {booking.paymentStatus}</span><Link className="booking-secondary-button" to={`/customer/bookings/${encodeURIComponent(booking.id)}`}>View Details</Link></div>
            </article>
          ))}
          {visibleBookings.length === 0 ? <p className="customer-booking-empty">There are no {activeFilter.toLowerCase()} bookings.</p> : null}
        </section>
      </main>
    </div>
  );
}

function BookingProgress({ booking }) {
  if (booking.status === 'Cancelled') return <p className="customer-cancellation-note">{booking.cancellationMessage || 'This booking was cancelled.'}</p>;
  const currentStep = booking.status === 'Pending' ? 0 : booking.status === 'Confirmed' ? 1 : booking.status === 'In Progress' ? 2 : 4;
  return (
    <ol className="customer-booking-progress" aria-label="Booking progress">
      {progressLabels.map((label, index) => (
        <li key={label} className={index < currentStep ? 'is-complete' : index === currentStep ? 'is-current' : ''}>
          <span>{index < currentStep ? '✓' : index + 1}</span><strong>{label}</strong>
        </li>
      ))}
    </ol>
  );
}

function DetailSection({ title, children, className = '' }) {
  return <section className={`customer-booking-detail-section ${className}`}><h2>{title}</h2>{children}</section>;
}

function DetailRow({ label, children }) {
  return <div className="customer-booking-detail-row"><span>{label}</span><strong>{children || 'Not provided'}</strong></div>;
}

function BookingDetails() {
  const { id } = useParams();
  const booking = getCustomerBooking(id);
  if (!booking) return <NotFound />;

  return (
    <div className="find-butcher-page customer-bookings-page">
      <CustomerNavigation />
      <main className="customer-bookings-main">
        <Link className="details-back-link" to="/customer/bookings">← Booking History</Link>
        <header className="customer-bookings-heading customer-booking-detail-heading">
          <div><p className="finder-eyebrow">Booking details</p><h1>{booking.reference}</h1><span className={statusClass(booking.status)}>{booking.status}</span></div>
          <span className="customer-booking-created">Created {formatDate(booking.createdDate)}</span>
        </header>
        <BookingProgress booking={booking} />
        {booking.status === 'Completed' ? (
          <section className="customer-booking-outcome is-completed"><strong>Service completed {formatDate(booking.completedDate)}</strong><span>Total {money(booking.total)} · Advance {money(booking.advancePaid)} · Remaining cash {money(booking.total - booking.advancePaid)} · Payment completed</span><Link className="booking-secondary-button" to={`/customer/reviews/${encodeURIComponent(booking.id)}`}>{booking.review ? 'Review Submitted' : 'Leave a Review'}</Link></section>
        ) : null}
        <div className="customer-booking-detail-grid">
          <DetailSection title="Booking Information">
            <DetailRow label="Reference">{booking.reference}</DetailRow><DetailRow label="Booking status">{booking.status}</DetailRow><DetailRow label="Booking date">{formatDate(booking.date)}</DetailRow><DetailRow label="Booking time">{formatTime(booking.time)}</DetailRow><DetailRow label="Created date">{formatDate(booking.createdDate)}</DetailRow>
          </DetailSection>
          <DetailSection title="Butcher Information">
            <div className="customer-booking-butcher">
              {booking.butcherImage ? <img src={booking.butcherImage} alt={booking.butcherName} /> : <span>{booking.butcherInitials}</span>}
              <div><h3>{booking.butcherName}</h3><VerifiedMark verified={booking.butcherVerified} /><p>★ {Number(booking.butcherRating).toFixed(1)} · {booking.butcherLocation}</p></div>
            </div>
            <DetailRow label="Contact"><a href={`tel:${booking.butcherPhone}`}>Call butcher</a></DetailRow>
          </DetailSection>
          <DetailSection title="Service Information">
            <DetailRow label="Service">{booking.serviceName}</DetailRow><DetailRow label="Animal type">{booking.animal}</DetailRow><DetailRow label="Description">{booking.serviceDescription}</DetailRow><DetailRow label="Service price">{money(booking.total)}</DetailRow>
          </DetailSection>
          <DetailSection title="Service Location">
            <DetailRow label="Full address">{booking.address}</DetailRow><DetailRow label="Area">{booking.area}</DetailRow><DetailRow label="City">{booking.city}</DetailRow><DetailRow label="Instructions">{booking.instructions || 'None'}</DetailRow>
          </DetailSection>
          <DetailSection title="Payment Information" className="customer-booking-payment-section">
            <DetailRow label="Total price">{money(booking.total)}</DetailRow><DetailRow label="Advance paid online">{money(booking.advancePaid)}</DetailRow><DetailRow label="Remaining amount">{money(booking.remaining)}</DetailRow><DetailRow label="Remaining payment method">{booking.remainingPaymentMethod}</DetailRow><DetailRow label="Payment status">{booking.paymentStatus}</DetailRow><DetailRow label="Transaction reference">{booking.transactionReference}</DetailRow>
          </DetailSection>
        </div>
        <div className="customer-booking-detail-actions"><Link className="booking-secondary-button" to="/customer/bookings">Back to Booking History</Link><Link className="booking-primary-button" to="/dashboard/customer">Customer home</Link></div>
      </main>
    </div>
  );
}

function NotFound() {
  return <div className="find-butcher-page customer-bookings-page"><CustomerNavigation /><main className="customer-bookings-main"><section className="customer-booking-not-found"><h1>Booking not found</h1><p>This booking may have been cleared from local browser storage.</p><Link className="booking-primary-button" to="/customer/bookings">Go to Booking History</Link></section></main></div>;
}

export function BookingConfirmation() {
  const { id } = useParams();
  const booking = getCustomerBooking(id);
  if (!booking) return <NotFound />;
  return (
    <div className="find-butcher-page customer-bookings-page">
      <CustomerNavigation />
      <main className="customer-bookings-main customer-confirmation-main">
        <section className="customer-confirmation-panel">
          <p className="finder-eyebrow">Advance payment successful</p><h1>Booking request received</h1>
          <p className="customer-confirmation-message">Your mock advance payment is recorded. {booking.butcherName} must accept and confirm this booking before the service is scheduled.</p>
          <p className="customer-confirmation-reference">{booking.reference}</p>
          <dl className="customer-confirmation-summary">
            <div><dt>Butcher</dt><dd>{booking.butcherName} <VerifiedMark verified={booking.butcherVerified} /></dd></div>
            <div><dt>Service</dt><dd>{booking.serviceName} · {booking.animal}</dd></div>
            <div><dt>Date &amp; time</dt><dd>{formatDate(booking.date)} · {formatTime(booking.time)}</dd></div>
            <div><dt>Location</dt><dd>{booking.address}, {booking.area}, {booking.city}</dd></div>
            <div><dt>Total service price</dt><dd>{money(booking.total)}</dd></div>
            <div><dt>Advance paid</dt><dd>{money(booking.advancePaid)}</dd></div>
            <div><dt>Remaining · Cash</dt><dd>{money(booking.remaining)}</dd></div>
            <div><dt>Booking status</dt><dd><span className={statusClass(booking.status)}>{booking.status}</span></dd></div>
          </dl>
          <div className="customer-confirmation-actions"><Link className="booking-primary-button" to={`/customer/bookings/${encodeURIComponent(booking.id)}`}>View Booking</Link><Link className="booking-secondary-button" to="/customer/bookings">Go to Booking History</Link><Link className="booking-secondary-button" to="/">Back to Home</Link></div>
        </section>
      </main>
    </div>
  );
}

export function ReviewPlaceholder() {
  const { id } = useParams();
  const booking = getCustomerBooking(id);
  return <div className="find-butcher-page customer-bookings-page"><CustomerNavigation /><main className="customer-bookings-main"><section className="customer-booking-not-found"><p className="finder-eyebrow">Customer feedback</p><h1>Reviews are coming soon</h1><p>{booking ? `Your completed booking with ${booking.butcherName} is ready for a review.` : 'This booking is not available.'}</p><Link className="booking-primary-button" to={booking ? `/customer/bookings/${encodeURIComponent(booking.id)}` : '/customer/bookings'}>Back to Booking</Link></section></main></div>;
}

export { BookingDetails, BookingHistory };