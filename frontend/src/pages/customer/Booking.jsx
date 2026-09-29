import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { butchers } from '../../components/customer/butchersData';
import { butcherProfileDetails, getButcherServices } from '../../components/customer/butcherProfileData';
import { createCustomerBooking } from '../../components/customer/customerBookings';
import { validatePhone } from '../../utils/validation';
import { CustomerNavigation, VerifiedMark } from './FindButchers';
import './ButcherDetails.css';
import './Booking.css';

const progressSteps = ['Service', 'Schedule', 'Location', 'Review', 'Payment'];
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getMinimumDate() {
  const today = new Date();
  const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
}

function getScheduleForDate(date, schedule) {
  if (!date) return null;
  const dayName = weekdays[new Date(`${date}T12:00:00`).getDay()];
  return schedule.find(([days]) => {
    const [start, end] = days.split(' - ');
    if (!end) return start === dayName;
    const startIndex = weekdays.indexOf(start);
    const endIndex = weekdays.indexOf(end);
    const dayIndex = weekdays.indexOf(dayName);
    return dayIndex >= startIndex && dayIndex <= endIndex;
  }) || null;
}

function timeToMinutes(time) {
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  const hour = Number(match[1]) % 12 + (match[3].toUpperCase() === 'PM' ? 12 : 0);
  return hour * 60 + Number(match[2]);
}

function timeToInput(time) {
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return '';
  const hour = Number(match[1]) % 12 + (match[3].toUpperCase() === 'PM' ? 12 : 0);
  return `${String(hour).padStart(2, '0')}:${match[2]}`;
}

function formatDate(date) {
  if (!date) return 'Not selected';
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-BD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function BookingProgress({ step }) {
  return (
    <ol className="booking-progress" aria-label="Booking progress">
      {progressSteps.map((label, index) => (
        <li className={index === step ? 'is-current' : index < step ? 'is-complete' : ''} key={label}>
          <span className="booking-progress-number">{index < step ? '✓' : index + 1}</span>
          <span>{label}</span>
        </li>
      ))}
    </ol>
  );
}

function SelectedButcher({ butcher, selectedService }) {
  return (
    <section className="booking-butcher" aria-label="Selected butcher">
      {butcher.image ? <img src={butcher.image} alt={butcher.name} /> : <span className="booking-butcher-initials">{butcher.initials}</span>}
      <div className="booking-butcher-info">
        <p className="booking-kicker">Selected butcher</p>
        <h2>{butcher.name}</h2>
        <div className="booking-butcher-meta">
          <VerifiedMark verified={butcher.verified} />
          <span className="booking-rating"><strong>★ {butcher.rating.toFixed(1)}</strong> · {butcher.area}</span>
        </div>
      </div>
      <div className="booking-selected-service">
        <span>Selected service</span>
        <strong>{selectedService?.name || 'Choose a service'}</strong>
        {selectedService ? <small>৳{selectedService.price.toLocaleString('en-BD')}</small> : null}
      </div>
    </section>
  );
}

function PriceSummary({ selectedService }) {
  const servicePrice = selectedService?.price || 0;
  return (
    <aside className="booking-price-summary" aria-label="Price summary">
      <p className="booking-kicker">Price summary</p>
      <h2>Booking total</h2>
      <div><span>Service price</span><strong>৳{servicePrice.toLocaleString('en-BD')}</strong></div>
      <div><span>Additional charges</span><strong>৳0</strong></div>
      <div className="booking-price-total"><span>Total</span><strong>৳{servicePrice.toLocaleString('en-BD')}</strong></div>
      <p>No payment is taken in this preview.</p>
    </aside>
  );
}

function Booking({ butcher, services, profile, booking, setBooking, step, errors, setErrors, onContinue, onBack }) {
  const selectedService = services.find((service) => service.id === booking.serviceId);
  const daySchedule = getScheduleForDate(booking.date, profile.schedule);
  const timeRange = daySchedule?.[1].split(' - ') || [];
  const minimumTime = timeRange[0] ? timeToInput(timeRange[0]) : '';
  const maximumTime = timeRange[1] ? timeToInput(timeRange[1]) : '';
  const setField = (field, value) => {
    setBooking((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  return (
    <div className="find-butcher-page booking-page">
      <CustomerNavigation />
      <main className="booking-main">
        <Link className="details-back-link" to={`/dashboard/customer/find-butcher/${butcher.id}`}>← Back to Butcher Profile</Link>
        <header className="booking-intro">
          <p className="finder-eyebrow">QurbaniX · Service booking</p>
          <h1>Book Your Qurbani Service</h1>
          <p>Choose your service, schedule your preferred time, and provide your service location.</p>
        </header>

        <BookingProgress step={step} />
        <SelectedButcher butcher={butcher} selectedService={selectedService} />

        <div className="booking-layout">
          <section className="booking-step-panel" aria-live="polite">
            {step === 0 ? (
              <div className="booking-step-content">
                <div className="booking-step-heading">
                  <p className="booking-kicker">Step 1 of 4</p>
                  <h2>Select a service</h2>
                  <p>Choose one of the services offered by {butcher.name}.</p>
                </div>
                <fieldset className="booking-service-options">
                  <legend className="booking-sr-only">Available services</legend>
                  {services.map((service) => (
                    <label className={`booking-service-option ${booking.serviceId === service.id ? 'is-selected' : ''}`} key={service.id}>
                      <input
                        type="radio"
                        name="service"
                        value={service.id}
                        checked={booking.serviceId === service.id}
                        onChange={() => setField('serviceId', service.id)}
                        disabled={!butcher.verified || butcher.availability === 'Unavailable'}
                      />
                      <span className="booking-radio-mark" aria-hidden="true" />
                      <span className="booking-service-copy">
                        <strong>{service.name}</strong>
                        <small>{service.animal === 'Shared Cow' ? 'One share of a cow' : `${service.animal} service`} · {service.duration}</small>
                        <small className="booking-service-description">{service.description}</small>
                      </span>
                      <strong className="booking-service-price">৳{service.price.toLocaleString('en-BD')}{service.animal === 'Shared Cow' ? ' / share' : ''}</strong>
                    </label>
                  ))}
                </fieldset>
                {errors.serviceId ? <p className="booking-error" role="alert">{errors.serviceId}</p> : null}
              </div>
            ) : null}

            {step === 1 ? (
              <div className="booking-step-content">
                <div className="booking-step-heading">
                  <p className="booking-kicker">Step 2 of 4</p>
                  <h2>Choose date &amp; time</h2>
                  <p>Available hours are based on this butcher&apos;s schedule.</p>
                </div>
                <div className="booking-field-grid">
                  <label className="booking-field">
                    <span>Preferred date <b>*</b></span>
                    <input
                      type="date"
                      min={getMinimumDate()}
                      value={booking.date}
                      aria-invalid={Boolean(errors.date)}
                      onChange={(event) => {
                        const date = event.target.value;
                        const schedule = getScheduleForDate(date, profile.schedule);
                        if (date && !schedule) {
                          setBooking((current) => ({ ...current, date: '', time: '' }));
                          setErrors((current) => ({ ...current, date: 'This butcher is not scheduled for the selected day.' }));
                          return;
                        }
                        setBooking((current) => ({ ...current, date, time: '' }));
                        setErrors((current) => ({ ...current, date: '', time: '' }));
                      }}
                    />
                    {errors.date ? <small className="booking-error" role="alert">{errors.date}</small> : null}
                  </label>
                  <label className="booking-field">
                    <span>Preferred time <b>*</b></span>
                    <input
                      type="time"
                      min={minimumTime}
                      max={maximumTime}
                      value={booking.time}
                      disabled={!booking.date || !daySchedule}
                      aria-invalid={Boolean(errors.time)}
                      onChange={(event) => setField('time', event.target.value)}
                    />
                    <small>{daySchedule ? `Available ${daySchedule[1]}` : 'Select an available date first.'}</small>
                    {errors.time ? <small className="booking-error" role="alert">{errors.time}</small> : null}
                  </label>
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="booking-step-content">
                <div className="booking-step-heading">
                  <p className="booking-kicker">Step 3 of 4</p>
                  <h2>Service location &amp; customer</h2>
                  <p>Where should the butcher provide the service?</p>
                </div>
                <div className="booking-form-section">
                  <h3>Service location</h3>
                  <label className="booking-field booking-field-full">
                    <span>Full address <b>*</b></span>
                    <input value={booking.address} onChange={(event) => setField('address', event.target.value)} placeholder="House 12, Road 5" aria-invalid={Boolean(errors.address)} />
                    {errors.address ? <small className="booking-error" role="alert">{errors.address}</small> : null}
                  </label>
                  <div className="booking-field-grid">
                    <label className="booking-field">
                      <span>Area <b>*</b></span>
                      <input value={booking.area} onChange={(event) => setField('area', event.target.value)} placeholder="Dhanmondi" aria-invalid={Boolean(errors.area)} />
                      {errors.area ? <small className="booking-error" role="alert">{errors.area}</small> : null}
                    </label>
                    <label className="booking-field">
                      <span>City <b>*</b></span>
                      <input value={booking.city} onChange={(event) => setField('city', event.target.value)} placeholder="Dhaka" aria-invalid={Boolean(errors.city)} />
                      {errors.city ? <small className="booking-error" role="alert">{errors.city}</small> : null}
                    </label>
                  </div>
                  <label className="booking-field booking-field-full">
                    <span>Additional instructions <small>(optional)</small></span>
                    <textarea rows="3" value={booking.instructions} onChange={(event) => setField('instructions', event.target.value)} placeholder="Gate or arrival instructions" />
                  </label>
                </div>
                <div className="booking-form-section">
                  <h3>Customer information</h3>
                  <div className="booking-field-grid">
                    <label className="booking-field">
                      <span>Customer name <b>*</b></span>
                      <input autoComplete="name" value={booking.customerName} onChange={(event) => setField('customerName', event.target.value)} placeholder="Your full name" aria-invalid={Boolean(errors.customerName)} />
                      {errors.customerName ? <small className="booking-error" role="alert">{errors.customerName}</small> : null}
                    </label>
                    <label className="booking-field">
                      <span>Phone number <b>*</b></span>
                      <input type="tel" autoComplete="tel-national" inputMode="tel" value={booking.phone} onChange={(event) => setField('phone', event.target.value)} placeholder="01XXXXXXXXX" aria-invalid={Boolean(errors.phone)} />
                      {errors.phone ? <small className="booking-error" role="alert">{errors.phone}</small> : null}
                    </label>
                  </div>
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="booking-step-content">
                <div className="booking-step-heading">
                  <p className="booking-kicker">Step 4 of 4</p>
                  <h2>Review your booking</h2>
                  <p>Check the details below before continuing to payment.</p>
                </div>
                <div className="booking-review-grid">
                  <section><h3>Butcher</h3><strong>{butcher.name}</strong><span>{butcher.verified ? 'Verified Butcher' : 'Verification pending'} · ★ {butcher.rating.toFixed(1)}</span><span>{butcher.area}</span></section>
                  <section><h3>Service</h3><strong>{selectedService?.name}</strong><span>{selectedService?.animal}</span><span>৳{selectedService?.price.toLocaleString('en-BD')}</span></section>
                  <section><h3>Schedule</h3><strong>{formatDate(booking.date)}</strong><span>{booking.time}</span></section>
                  <section><h3>Location</h3><strong>{booking.address}</strong><span>{booking.area}, {booking.city}</span>{booking.instructions ? <span>{booking.instructions}</span> : null}</section>
                  <section><h3>Customer</h3><strong>{booking.customerName}</strong><span>{booking.phone}</span></section>
                  <section className="booking-review-total"><h3>Total</h3><strong>৳{selectedService?.price.toLocaleString('en-BD')}</strong><span>Additional charges: ৳0</span></section>
                </div>
              </div>
            ) : null}

            <div className="booking-step-actions">
              {step === 0 ? (
                <Link className="booking-secondary-button" to={`/dashboard/customer/find-butcher/${butcher.id}`}>Back</Link>
              ) : (
                <button className="booking-secondary-button" type="button" onClick={onBack}>Back</button>
              )}
              {step < 3 ? (
                <button className="booking-primary-button" type="button" onClick={onContinue}>Continue</button>
              ) : (
                <button className="booking-primary-button" type="button" onClick={onContinue}>Proceed to Payment <span aria-hidden="true">→</span></button>
              )}
            </div>
          </section>

          <PriceSummary selectedService={selectedService} />
        </div>
      </main>
    </div>
  );
}

function BookingPage() {
  const { butcherId } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const butcher = butchers.find((item) => item.id === butcherId);
  const profile = butcherProfileDetails[butcherId];
  const services = butcher ? getButcherServices(butcher) : [];
  const canBook = butcher?.verified && butcher.availability !== 'Unavailable';
  const requestedServiceId = searchParams.get('service');
  const initialService = services.find((service) => service.id === requestedServiceId);
  const [booking, setBooking] = useState(() => location.state?.booking || {
    serviceId: initialService?.id || '',
    date: '',
    time: '',
    address: '',
    area: butcher?.area.split(',')[0] || '',
    city: butcher?.area.split(',').at(-1)?.trim() || '',
    instructions: '',
    customerName: '',
    phone: '',
  });
  const [step, setStep] = useState(location.state?.step || 0);
  const [errors, setErrors] = useState({});

  if (!butcher || !profile) {
    return (
      <div className="find-butcher-page booking-page">
        <CustomerNavigation />
        <main className="booking-main">
          <section className="booking-error-panel"><h1>Booking not available</h1><p>This butcher could not be found.</p><Link className="booking-primary-button" to="/dashboard/customer/find-butcher">Back to Butchers</Link></section>
        </main>
      </div>
    );
  }

  if (!canBook) {
    return (
      <div className="find-butcher-page booking-page">
        <CustomerNavigation />
        <main className="booking-main">
          <Link className="details-back-link" to={`/dashboard/customer/find-butcher/${butcher.id}`}>← Back to Butcher Profile</Link>
          <section className="booking-error-panel"><h1>Booking unavailable</h1><p>{butcher.verified ? 'This butcher is currently unavailable.' : 'This butcher is not verified yet.'}</p><Link className="booking-primary-button" to={`/dashboard/customer/find-butcher/${butcher.id}`}>Return to profile</Link></section>
        </main>
      </div>
    );
  }

  const validateStep = () => {
    const nextErrors = {};
    const selectedService = services.find((service) => service.id === booking.serviceId);
    if (step === 0 && !selectedService) nextErrors.serviceId = 'Select a service to continue.';
    if (step === 1) {
      if (!booking.date) nextErrors.date = 'Choose an available date.';
      else if (booking.date < getMinimumDate()) nextErrors.date = 'Choose today or a future date.';
      else if (!getScheduleForDate(booking.date, profile.schedule)) nextErrors.date = 'This butcher is not scheduled for the selected day.';
      if (!booking.time) nextErrors.time = 'Choose a preferred time.';
      else if (booking.date) {
        const schedule = getScheduleForDate(booking.date, profile.schedule);
        const bounds = schedule?.[1].split(' - ') || [];
        const selectedMinutes = Number(booking.time.slice(0, 2)) * 60 + Number(booking.time.slice(3, 5));
        if (!bounds.length || selectedMinutes < timeToMinutes(bounds[0]) || selectedMinutes > timeToMinutes(bounds[1])) {
          nextErrors.time = 'Choose a time within the butcher’s working hours.';
        }
      }
    }
    if (step === 2) {
      if (!booking.address.trim()) nextErrors.address = 'Enter the full service address.';
      if (!booking.area.trim()) nextErrors.area = 'Enter the service area.';
      if (!booking.city.trim()) nextErrors.city = 'Enter the city.';
      if (!booking.customerName.trim()) nextErrors.customerName = 'Enter the customer name.';
      if (!booking.phone.trim()) nextErrors.phone = 'Enter a phone number.';
      else if (!validatePhone(booking.phone)) nextErrors.phone = 'Enter a valid Bangladesh phone number (01XXXXXXXXX).';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validateStep()) return;
    if (step < 3) {
      setStep((current) => current + 1);
      return;
    }
    navigate(`/dashboard/customer/payment/${butcher.id}`, {
      state: { booking: { ...booking, butcherId: butcher.id }, step: 4 },
    });
  };

  return (
    <Booking
      butcher={butcher}
      services={services}
      profile={profile}
      booking={booking}
      setBooking={setBooking}
      step={step}
      errors={errors}
      setErrors={setErrors}
      onContinue={handleContinue}
      onBack={() => {
        setErrors({});
        setStep((current) => Math.max(0, current - 1));
      }}
    />
  );
}

export function PaymentPlaceholder() {
  const { butcherId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.booking;
  const butcher = butchers.find((item) => item.id === butcherId);
  const services = butcher ? getButcherServices(butcher) : [];
  const selectedService = services.find((service) => service.id === booking?.serviceId);
  const bookingPath = `/dashboard/customer/book/${butcherId}?service=${encodeURIComponent(booking?.serviceId || '')}`;

  return (
    <div className="find-butcher-page booking-page">
      <CustomerNavigation />
      <main className="booking-main payment-placeholder-main">
        <BookingProgress step={4} />
        <section className="payment-placeholder-panel">
          <p className="booking-kicker">Step 5 · Payment</p>
          <h1>Pay your booking advance</h1>
          <p>This is a mock payment preview. No real payment method or charge is involved.</p>
          {booking && butcher && selectedService ? (
            <div className="payment-preview-summary">
              <div><span>Butcher</span><strong>{butcher.name}</strong></div>
              <div><span>Service</span><strong>{selectedService.name}</strong></div>
              <div><span>Date &amp; time</span><strong>{formatDate(booking.date)} · {booking.time}</strong></div>
              <div><span>Location</span><strong>{booking.address}, {booking.area}, {booking.city}</strong></div>
              <div><span>Customer</span><strong>{booking.customerName}</strong></div>
              <div><span>Phone</span><strong>{booking.phone}</strong></div>
              <div><span>Total</span><strong>৳{selectedService.price.toLocaleString('en-BD')}</strong></div>
            </div>
          ) : (
            <p className="payment-preview-note">Open this step after reviewing a booking to see its summary here.</p>
          )}
          <p className="payment-preview-note">The remaining balance is paid in cash after the service.</p>
          <div className="booking-step-actions">
            <Link className="booking-secondary-button" to={bookingPath} state={{ booking, step: 3 }}>Back to Review</Link>
            {booking && butcher && selectedService ? (
              <button
                className="booking-primary-button"
                type="button"
                onClick={() => {
                  const savedBooking = createCustomerBooking({ booking, butcher, service: selectedService });
                  navigate(`/customer/booking-confirmation/${encodeURIComponent(savedBooking.id)}`);
                }}
              >
                Mock pay advance ৳{Math.ceil(selectedService.price * 0.2).toLocaleString('en-BD')}
              </button>
            ) : (
              <Link className="booking-primary-button" to={`/dashboard/customer/find-butcher/${butcherId}`}>Return to profile</Link>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default BookingPage;