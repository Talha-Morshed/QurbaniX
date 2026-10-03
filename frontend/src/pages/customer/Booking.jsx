import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../../api';
import { useAuth } from '../../auth/AuthContext';
import { mapApiBooking } from '../../utils/apiBookings';
import { mapButcherDetailsResponse } from '../../utils/butcherDirectory';
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
      <div><span>Additional charge details</span><strong>{selectedService?.additional || 'Not specified'}</strong></div>
      <div className="booking-price-total"><span>Total</span><strong>৳{servicePrice.toLocaleString('en-BD')}</strong></div>
      <p>No payment is taken in this preview.</p>
    </aside>
  );
}

function Booking({ butcher, services, profile, booking, setBooking, step, errors, setErrors, onContinue, onBack, isSubmitting, submitError }) {
  const selectedService = services.find((service) => service.id === booking.serviceId);
  const daySchedule = getScheduleForDate(booking.date, profile.schedule);
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
                  <p>The butcher will confirm the selected date and time.</p>
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
                      value={booking.time}
                      disabled={!booking.date}
                      aria-invalid={Boolean(errors.time)}
                      onChange={(event) => setField('time', event.target.value)}
                    />
                    <small>{daySchedule ? `Usual hours ${daySchedule[1]}; final availability is confirmed on submission.` : 'Final availability is confirmed on submission.'}</small>
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
                      <input autoComplete="name" value={booking.customerName} readOnly />
                    </label>
                    <label className="booking-field">
                      <span>Phone number <b>*</b></span>
                      <input type="tel" autoComplete="tel-national" value={booking.phone} readOnly />
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
                  <section className="booking-review-total"><h3>Total</h3><strong>৳{selectedService?.price.toLocaleString('en-BD')}</strong><span>Additional charge details: {selectedService?.additional || 'Not specified'}</span></section>
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
                <button className="booking-primary-button" type="button" onClick={onContinue} disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit Booking'} <span aria-hidden="true">→</span></button>
              )}
            </div>
            {submitError ? <p className="booking-error" role="alert">{submitError}</p> : null}
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
  const { user } = useAuth();
  const [butcher, setButcher] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [retryKey, setRetryKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [booking, setBooking] = useState(() => location.state?.booking || {
    serviceId: searchParams.get('service') || '',
    date: '',
    time: '',
    address: '',
    area: '',
    city: '',
    instructions: '',
    customerName: user?.name || '',
    phone: user?.phone || '',
  });
  const [step, setStep] = useState(location.state?.step || 0);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let isCurrentRequest = true;
    setIsLoading(true);
    setLoadError('');

    api.butcher(butcherId)
      .then((response) => {
        if (isCurrentRequest) setButcher(mapButcherDetailsResponse(response));
      })
      .catch((requestError) => {
        if (!isCurrentRequest) return;
        setButcher(null);
        setLoadError(requestError?.message || 'Unable to load this butcher. Please try again.');
      })
      .finally(() => {
        if (isCurrentRequest) setIsLoading(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [butcherId, retryKey]);

  const profile = butcher;
  const services = butcher?.services || [];
  const canBook = butcher?.verified && butcher.availability !== 'Unavailable';
  const requestedServiceId = searchParams.get('service');

  useEffect(() => {
    if (!butcher) return;
    setBooking((current) => ({
      ...current,
      serviceId: current.serviceId || requestedServiceId || '',
      area: current.area || butcher.areaName,
      city: current.city || butcher.city,
      customerName: user?.name || '',
      phone: user?.phone || '',
    }));
  }, [butcher, requestedServiceId, user?.name, user?.phone]);

  if (isLoading || loadError || !butcher) {
    return (
      <div className="find-butcher-page booking-page">
        <CustomerNavigation />
        <main className="booking-main">
          <section className="booking-error-panel" role={isLoading ? 'status' : 'alert'}>
            <h1>{isLoading ? 'Loading butcher' : 'Booking unavailable'}</h1>
            <p>{isLoading ? 'Fetching the butcher’s live services.' : loadError || 'This butcher could not be found.'}</p>
            {!isLoading && loadError ? <button className="booking-primary-button" type="button" onClick={() => setRetryKey((current) => current + 1)}>Try again</button> : null}
            <Link className="booking-primary-button" to="/dashboard/customer/find-butcher">Back to Butchers</Link>
          </section>
        </main>
      </div>
    );
  }

  if (!canBook || services.length === 0) {
    return (
      <div className="find-butcher-page booking-page">
        <CustomerNavigation />
        <main className="booking-main">
          <Link className="details-back-link" to={`/dashboard/customer/find-butcher/${butcher.id}`}>← Back to Butcher Profile</Link>
          <section className="booking-error-panel"><h1>Booking unavailable</h1><p>{!butcher.verified ? 'This butcher is not verified.' : butcher.availability === 'Unavailable' ? 'This butcher is currently unavailable.' : 'This butcher has no available services.'}</p><Link className="booking-primary-button" to={`/dashboard/customer/find-butcher/${butcher.id}`}>Return to profile</Link></section>
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
      if (!booking.time) nextErrors.time = 'Choose a preferred time.';
    }
    if (step === 2) {
      if (!booking.address.trim()) nextErrors.address = 'Enter the full service address.';
      if (!booking.area.trim()) nextErrors.area = 'Enter the service area.';
      if (!booking.city.trim()) nextErrors.city = 'Enter the city.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleContinue = async () => {
    setSubmitError('');
    if (!validateStep()) return;
    if (step < 3) {
      setStep((current) => current + 1);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.createBooking({
        service_id: Number(booking.serviceId),
        service_date: booking.date,
        service_time: booking.time,
        address: booking.address.trim(),
        area: booking.area.trim(),
        city: booking.city.trim(),
        instructions: booking.instructions.trim() || null,
      });
      const createdBooking = mapApiBooking(response.booking);
      navigate(`/customer/booking-confirmation/${createdBooking.id}`, { state: { booking: createdBooking } });
    } catch (requestError) {
      const validationErrors = requestError?.errors || {};
      setErrors((current) => ({
        ...current,
        date: validationErrors.service_date?.[0] || '',
        time: validationErrors.service_time?.[0] || '',
        address: validationErrors.address?.[0] || '',
        area: validationErrors.area?.[0] || '',
        city: validationErrors.city?.[0] || '',
        instructions: validationErrors.instructions?.[0] || '',
        serviceId: validationErrors.service_id?.[0] || '',
      }));
      setSubmitError(requestError?.message || 'Unable to create the booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
      isSubmitting={isSubmitting}
      submitError={submitError}
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
  const bookingPath = `/dashboard/customer/book/${butcherId}?service=${encodeURIComponent(booking?.serviceId || '')}`;

  return (
    <div className="find-butcher-page booking-page">
      <CustomerNavigation />
      <main className="booking-main payment-placeholder-main">
        <BookingProgress step={4} />
        <section className="payment-placeholder-panel">
          <p className="booking-kicker">Booking update</p>
          <h1>Live booking confirmation</h1>
          <p>This booking flow is handled by the QurbaniX backend. The server creates the booking and the confirmed reference is shown on the booking confirmation page.</p>
          {booking ? (
            <div className="payment-preview-summary">
              <div><span>Butcher</span><strong>{booking.butcherName}</strong></div>
              <div><span>Service</span><strong>{booking.serviceName}</strong></div>
              <div><span>Date &amp; time</span><strong>{formatDate(booking.date)} · {booking.time}</strong></div>
              <div><span>Location</span><strong>{booking.address}, {booking.area}, {booking.city}</strong></div>
              <div><span>Customer</span><strong>{booking.customerName || 'Customer'}</strong></div>
              <div><span>Phone</span><strong>{booking.phone || 'Not provided'}</strong></div>
              <div><span>Total</span><strong>{booking.total ? `৳${Number(booking.total).toLocaleString('en-BD')}` : 'Not available'}</strong></div>
            </div>
          ) : (
            <p className="payment-preview-note">Open this step after reviewing a booking to see its summary here.</p>
          )}
          <p className="payment-preview-note">Advance and remaining payment details are taken from the backend record and displayed on the real booking confirmation.</p>
          <div className="booking-step-actions">
            <Link className="booking-secondary-button" to={bookingPath} state={{ booking, step: 3 }}>Back to Review</Link>
            {booking ? (
              <button className="booking-primary-button" type="button" onClick={() => navigate(`/customer/booking-confirmation/${encodeURIComponent(booking.id)}`)}>View confirmation</button>
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