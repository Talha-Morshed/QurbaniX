import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../api';
import { mapApiBooking } from '../../utils/apiBookings';
import { CustomerNavigation, VerifiedMark } from './FindButchers';
import './CustomerBookings.css';

const filters = ['All', 'Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'];
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

function useApiBooking(id) {
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let isCurrentRequest = true;
    setIsLoading(true);
    setError('');

    api.customerBooking(id)
      .then((response) => {
        if (isCurrentRequest) setBooking(mapApiBooking(response.booking));
      })
      .catch((requestError) => {
        if (!isCurrentRequest) return;
        setBooking(null);
        setError(requestError?.message || 'This booking could not be loaded.');
      })
      .finally(() => {
        if (isCurrentRequest) setIsLoading(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [id, retryKey]);

  return { booking, isLoading, error, retry: () => setRetryKey((current) => current + 1), updateBooking: setBooking };
}

function BookingHistory() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let isCurrentRequest = true;
    setIsLoading(true);
    setError('');

    api.customerBookings({ per_page: 100 })
      .then((response) => {
        if (isCurrentRequest) setBookings((response.data || []).map(mapApiBooking));
      })
      .catch((requestError) => {
        if (!isCurrentRequest) return;
        setBookings([]);
        setError(requestError?.message || 'Unable to load your bookings. Please try again.');
      })
      .finally(() => {
        if (isCurrentRequest) setIsLoading(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [retryKey]);

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
        <section className="customer-booking-list" aria-live="polite" aria-busy={isLoading}>
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
                <div><span>Total / advance amount</span><strong>{money(booking.total)} / {money(booking.advanceAmount)}</strong></div>
                <div><span>Remaining / payment</span><strong>{money(booking.remaining)} · {booking.paymentStatus}</strong></div>
              </div>
              <div className="customer-booking-card-footer"><span>Payment: {booking.paymentStatus}</span><Link className="booking-secondary-button" to={`/customer/bookings/${encodeURIComponent(booking.id)}`}>View Details</Link></div>
            </article>
          ))}
          {isLoading ? <p className="customer-booking-empty" role="status">Loading bookings...</p> : null}
          {!isLoading && error ? <div className="customer-booking-empty" role="alert"><p>{error}</p><button className="booking-secondary-button" type="button" onClick={() => setRetryKey((current) => current + 1)}>Try again</button></div> : null}
          {!isLoading && !error && visibleBookings.length === 0 ? <p className="customer-booking-empty">There are no {activeFilter.toLowerCase()} bookings.</p> : null}
        </section>
      </main>
    </div>
  );
}

function BookingProgress({ booking }) {
  if (booking.status === 'Cancelled') return <p className="customer-cancellation-note">{booking.cancellationMessage || 'This booking was cancelled.'}</p>;
  const currentStep = booking.status === 'Pending' ? 0
    : booking.status === 'Confirmed' ? 1
      : booking.status === 'In Progress' ? 2
        : booking.status === 'Completed' ? (booking.paymentStatus === 'Paid in full' ? 4 : 3)
          : 0;
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
  const { booking, isLoading, error, retry, updateBooking } = useApiBooking(id);
  const [paymentAction, setPaymentAction] = useState('');
  const [paymentNotice, setPaymentNotice] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [isRefreshingPayment, setIsRefreshingPayment] = useState(false);

  const refreshBooking = async () => {
    const response = await api.customerBooking(id);
    const refreshedBooking = mapApiBooking(response.booking);
    updateBooking(refreshedBooking);
    return refreshedBooking;
  };

  const refreshPaymentStatus = async () => {
    setIsRefreshingPayment(true);
    setPaymentNotice('');
    setPaymentError('');
    try {
      await refreshBooking();
      setPaymentNotice('Payment status refreshed.');
    } catch (refreshError) {
      setPaymentError(refreshError?.message || 'Unable to refresh payment status. Please try again.');
    } finally {
      setIsRefreshingPayment(false);
    }
  };

  const createCashPayment = async (purpose) => {
    setPaymentAction(purpose);
    setPaymentNotice('');
    setPaymentError('');
    try {
      const response = await api.createPayment(booking.id, { purpose, method: 'cash' });
      setPaymentNotice(response.message || 'Cash payment recorded. Both parties must confirm receipt.');
      try {
        await refreshBooking();
      } catch (refreshError) {
        setPaymentError(`Payment was recorded, but the booking could not be refreshed: ${refreshError.message || 'Please retry.'}`);
      }
    } catch (requestError) {
      setPaymentError(requestError?.message || 'Unable to record this payment. Please try again.');
    } finally {
      setPaymentAction('');
    }
  };

  const confirmCashPayment = async (paymentId) => {
    setPaymentAction(`confirm-${paymentId}`);
    setPaymentNotice('');
    setPaymentError('');
    try {
      const response = await api.customerConfirmPayment(paymentId);
      setPaymentNotice(response.message || 'Your cash payment confirmation was recorded.');
      try {
        await refreshBooking();
      } catch (refreshError) {
        setPaymentError(`Your confirmation was recorded, but the booking could not be refreshed: ${refreshError.message || 'Please retry.'}`);
      }
    } catch (requestError) {
      setPaymentError(requestError?.message || 'Unable to confirm this cash payment. Please try again.');
    } finally {
      setPaymentAction('');
    }
  };

  if (isLoading) return <LoadingBooking />;
  if (error || !booking) return <NotFound error={error} onRetry={retry} />;

  const advancePayment = booking.payments.find((payment) => payment.purpose === 'advance' && ['pending', 'paid'].includes(payment.status))
    || [...booking.payments].reverse().find((payment) => payment.purpose === 'advance');
  const balancePayment = booking.payments.find((payment) => payment.purpose === 'balance' && ['pending', 'paid'].includes(payment.status))
    || [...booking.payments].reverse().find((payment) => payment.purpose === 'balance');
  const hasActiveAdvance = booking.payments.some((payment) => payment.purpose === 'advance' && ['pending', 'paid'].includes(payment.status));
  const hasActiveBalance = booking.payments.some((payment) => payment.purpose === 'balance' && ['pending', 'paid'].includes(payment.status));
  const isCancelled = booking.status === 'Cancelled';
  const canCreateAdvance = !isCancelled && booking.advanceAmount > 0 && !hasActiveAdvance;
  const canCreateBalance = !isCancelled && booking.status === 'Completed' && booking.remaining > 0 && !hasActiveBalance;

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
          <section className="customer-booking-outcome is-completed"><strong>Service completed {formatDate(booking.completedDate)}</strong><span>Total {money(booking.total)} · Advance paid {money(booking.advancePaid)} · Remaining {money(booking.remaining)} · {booking.paymentStatus}</span><Link className="booking-secondary-button" to={`/customer/reviews/${encodeURIComponent(booking.id)}`}>{booking.review ? 'Review Submitted' : 'Leave a Review'}</Link></section>
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
            <div className="customer-payment-refresh">
              <span>Payment updates are loaded from your booking record.</span>
              <button className="booking-secondary-button" type="button" onClick={refreshPaymentStatus} disabled={Boolean(paymentAction) || isRefreshingPayment}>
                {isRefreshingPayment ? 'Refreshing...' : 'Refresh payment status'}
              </button>
            </div>
            <DetailRow label="Total price">{money(booking.total)}</DetailRow>
            <DetailRow label="Advance amount">{money(booking.advanceAmount)}</DetailRow>
            <DetailRow label="Advance payment status">
              {advancePayment ? `${advancePayment.status} · ${advancePayment.method}` : booking.advanceAmount <= 0 ? 'Not required' : 'No payment recorded'}
            </DetailRow>
            <DetailRow label="Advance paid">{money(booking.advancePaid)}</DetailRow>
            <DetailRow label="Remaining balance">{money(booking.remaining)}</DetailRow>
            <DetailRow label="Balance payment status">
              {balancePayment ? `${balancePayment.status} · ${balancePayment.method}` : booking.remaining <= 0 ? 'Paid in full' : 'No payment recorded'}
            </DetailRow>
            <DetailRow label="Booking payment status">{booking.paymentStatus}</DetailRow>
            <DetailRow label="Transaction reference">{booking.transactionReference || 'Not available'}</DetailRow>

            <div className="customer-payment-records" aria-live="polite">
              {booking.payments.length ? booking.payments.map((payment) => (
                <article className="customer-payment-record" key={payment.id}>
                  <div className="customer-payment-record-heading">
                    <strong>{payment.purpose === 'advance' ? 'Advance payment' : 'Balance payment'}</strong>
                    <span className={`customer-payment-status status-${payment.status}`}>{payment.status}</span>
                  </div>
                  <p>{money(payment.amount)} · {payment.method}</p>
                  <p>Customer confirmation: {payment.payerConfirmed ? 'Confirmed' : 'Awaiting'}</p>
                  <p>Butcher confirmation: {payment.receiverConfirmed ? 'Confirmed' : 'Awaiting'}</p>
                  {payment.method === 'cash' && payment.status === 'pending' && payment.receiverConfirmed && !payment.payerConfirmed && !isCancelled ? (
                    <button
                      className="booking-primary-button customer-payment-action"
                      type="button"
                      onClick={() => confirmCashPayment(payment.id)}
                      disabled={Boolean(paymentAction) || isRefreshingPayment}
                    >
                      {paymentAction === `confirm-${payment.id}` ? 'Confirming...' : 'Confirm cash payment'}
                    </button>
                  ) : null}
                  {payment.method === 'cash' && payment.status === 'pending' && payment.payerConfirmed && !payment.receiverConfirmed
                    ? <p className="customer-payment-waiting" role="status">Your confirmation is recorded; waiting for the butcher to confirm.</p>
                    : null}
                  {payment.method !== 'cash' && payment.status === 'pending'
                    ? <p className="customer-payment-unavailable">This online payment has not been processed. A payment gateway is not configured.</p>
                    : null}
                </article>
              )) : <p className="customer-payment-empty">No payment record yet.</p>}
            </div>

            {paymentNotice ? <p className="customer-payment-notice" role="status">{paymentNotice}</p> : null}
            {paymentError ? <p className="customer-payment-error" role="alert">{paymentError}</p> : null}
            {isCancelled ? <p className="customer-payment-unavailable">This booking was cancelled; no further payments can be made.</p> : (
              <div className="customer-payment-actions">
                {canCreateAdvance ? (
                  <button className="booking-primary-button" type="button" onClick={() => createCashPayment('advance')} disabled={Boolean(paymentAction) || isRefreshingPayment}>
                    {paymentAction === 'advance' ? 'Recording advance...' : `Pay advance in cash · ${money(booking.advanceAmount)}`}
                  </button>
                ) : null}
                {booking.status === 'Completed' && canCreateBalance ? (
                  <button className="booking-primary-button" type="button" onClick={() => createCashPayment('balance')} disabled={Boolean(paymentAction) || isRefreshingPayment}>
                    {paymentAction === 'balance' ? 'Recording balance...' : `Pay balance in cash · ${money(booking.remaining)}`}
                  </button>
                ) : null}
                {booking.status !== 'Completed' && booking.remaining > 0
                  ? <p className="customer-payment-waiting">The balance can be paid after the service is completed.</p>
                  : null}
                {!hasActiveBalance && booking.status === 'Completed' && booking.remaining <= 0
                  ? <p className="customer-payment-waiting">The booking balance is paid in full.</p>
                  : null}
                <div className="customer-payment-online-options" aria-label="Online payment methods unavailable">
                  <span>Online methods unavailable until a payment gateway is configured:</span>
                  <button type="button" disabled>bKash</button>
                  <button type="button" disabled>Nagad</button>
                  <button type="button" disabled>Card</button>
                </div>
              </div>
            )}
          </DetailSection>
        </div>
        <div className="customer-booking-detail-actions"><Link className="booking-secondary-button" to="/customer/bookings">Back to Booking History</Link><Link className="booking-primary-button" to="/dashboard/customer">Customer home</Link></div>
      </main>
    </div>
  );
}

function LoadingBooking() {
  return <div className="find-butcher-page customer-bookings-page"><CustomerNavigation /><main className="customer-bookings-main"><p className="customer-booking-empty" role="status">Loading booking...</p></main></div>;
}

function NotFound({ error, onRetry }) {
  return <div className="find-butcher-page customer-bookings-page"><CustomerNavigation /><main className="customer-bookings-main"><section className="customer-booking-not-found"><h1>Booking not found</h1><p>{error || 'This booking is not available.'}</p>{onRetry ? <button className="booking-secondary-button" type="button" onClick={onRetry}>Try again</button> : null}<Link className="booking-primary-button" to="/customer/bookings">Go to Booking History</Link></section></main></div>;
}

export function BookingConfirmation() {
  const { id } = useParams();
  const { booking, isLoading, error } = useApiBooking(id);
  if (isLoading) return <LoadingBooking />;
  if (error || !booking) return <NotFound error={error} />;
  return (
    <div className="find-butcher-page customer-bookings-page">
      <CustomerNavigation />
      <main className="customer-bookings-main customer-confirmation-main">
        <section className="customer-confirmation-panel">
          <p className="finder-eyebrow">Booking submitted</p><h1>Booking request received</h1>
          <p className="customer-confirmation-message">Your booking was submitted to {booking.butcherName}. Payment status is {booking.paymentStatus}; the butcher must confirm this request before the service is scheduled.</p>
          <p className="customer-confirmation-reference">{booking.reference}</p>
          <dl className="customer-confirmation-summary">
            <div><dt>Butcher</dt><dd>{booking.butcherName} <VerifiedMark verified={booking.butcherVerified} /></dd></div>
            <div><dt>Service</dt><dd>{booking.serviceName} · {booking.animal}</dd></div>
            <div><dt>Date &amp; time</dt><dd>{formatDate(booking.date)} · {formatTime(booking.time)}</dd></div>
            <div><dt>Location</dt><dd>{booking.address}, {booking.area}, {booking.city}</dd></div>
            <div><dt>Total service price</dt><dd>{money(booking.total)}</dd></div>
            <div><dt>Advance amount</dt><dd>{money(booking.advanceAmount)}</dd></div>
            <div><dt>Remaining amount</dt><dd>{money(booking.remaining)}</dd></div>
            <div><dt>Booking status</dt><dd><span className={statusClass(booking.status)}>{booking.status}</span></dd></div>
            <div><dt>Payment status</dt><dd>{booking.paymentStatus}</dd></div>
          </dl>
          <div className="customer-confirmation-actions"><Link className="booking-primary-button" to={`/customer/bookings/${encodeURIComponent(booking.id)}`}>View Booking</Link><Link className="booking-secondary-button" to="/customer/bookings">Go to Booking History</Link><Link className="booking-secondary-button" to="/">Back to Home</Link></div>
        </section>
      </main>
    </div>
  );
}

export { BookingDetails, BookingHistory };