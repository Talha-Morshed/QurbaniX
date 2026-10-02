import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../../api';
import { butchers } from '../../components/customer/butchersData';
import { getButcherServices } from '../../components/customer/butcherProfileData';
import { mapButcherDetailsResponse } from '../../utils/butcherDirectory';
import { CustomerNavigation, VerifiedMark } from './FindButchers';
import './ButcherDetails.css';

function StarRating({ rating, label }) {
  return (
    <span className="details-stars" aria-label={label || `${rating} out of 5 stars`}>
      {'★'.repeat(Math.round(rating))}<span>{'★'.repeat(5 - Math.round(rating))}</span>
    </span>
  );
}

function ButcherDetails() {
  const { butcherId } = useParams();
  const [butcher, setButcher] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let isCurrentRequest = true;
    setIsLoading(true);
    setError(null);

    api.butcher(butcherId)
      .then((response) => {
        if (isCurrentRequest) setButcher(mapButcherDetailsResponse(response));
      })
      .catch((requestError) => {
        if (!isCurrentRequest) return;
        setButcher(null);
        setError({
          status: requestError?.status,
          message: requestError?.message || 'Unable to load this butcher profile. Please try again.',
        });
      })
      .finally(() => {
        if (isCurrentRequest) setIsLoading(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [butcherId, retryKey]);

  if (isLoading || error || !butcher) {
    const notFound = error?.status === 404;

    return (
      <div className="find-butcher-page butcher-details-page">
        <CustomerNavigation />
        <main className="butcher-details-main">
          <Link className="details-back-link" to="/dashboard/customer/find-butcher">← Back to Butchers</Link>
          <section className="details-not-found">
            <h1>{isLoading ? 'Loading butcher profile' : notFound ? 'Butcher profile not found' : 'Unable to load butcher profile'}</h1>
            <p>{isLoading ? 'Fetching verified profile details.' : notFound ? 'This profile is not available in the current directory.' : error?.message}</p>
            {!isLoading && error && !notFound ? <button type="button" className="finder-search-button" onClick={() => setRetryKey((current) => current + 1)}>Try again</button> : null}
            <Link className="finder-search-button" to="/dashboard/customer/find-butcher">Browse verified butchers</Link>
          </section>
        </main>
      </div>
    );
  }

  const services = butcher.services;
  const totalReviewCount = butcher.reviewsCount;
  const overallRating = butcher.rating;
  const reviewCount = totalReviewCount.toLocaleString('en-BD');
  const currentRatingDistribution = butcher.ratingDistribution;
  const canBook = butcher.verified && butcher.availability !== 'Unavailable' && services.length > 0;
  const bookingBlockMessage = !butcher.verified
    ? 'Available after verification'
    : butcher.availability === 'Unavailable'
      ? 'Currently unavailable'
      : 'No services currently listed';
  const bookingPath = (serviceId) => `/dashboard/customer/book/${butcher.id}?service=${encodeURIComponent(serviceId)}`;

  return (
    <div className="find-butcher-page butcher-details-page">
      <CustomerNavigation />
      <main className="butcher-details-main">
        <Link className="details-back-link" to="/dashboard/customer/find-butcher">← Back to Butchers</Link>

        <section className="details-profile-header" aria-labelledby="details-profile-name">
          {butcher.image ? (
            <img className="details-profile-image" src={butcher.image} alt={butcher.name} />
          ) : (
            <span className="details-profile-initials">{butcher.initials}</span>
          )}
          <div className="details-profile-copy">
            <p className="finder-eyebrow">Customer profile</p>
            <h1 id="details-profile-name">{butcher.name}</h1>
            <VerifiedMark verified={butcher.verified} />
            <p className="details-profile-location">{butcher.area}</p>
          </div>
          <div className="details-profile-rating">
            <strong>{overallRating.toFixed(1)}</strong>
            <StarRating rating={overallRating} />
            <span>{reviewCount} reviews</span>
          </div>
          <div className="details-profile-stats">
            <div><strong>{butcher.experience ?? '—'}</strong><span>Years experience</span></div>
            <div><strong>{butcher.completedServices ?? '—'}</strong><span>Completed services</span></div>
            <div><strong>{butcher.availability}</strong><span>Current availability</span></div>
          </div>
        </section>

        <div className="details-content-grid">
          <div className="details-primary-column">
            <section className="details-section" aria-labelledby="details-about-heading">
              <p className="finder-eyebrow">Professional background</p>
              <h2 id="details-about-heading">About</h2>
                <p className="details-about-copy">{butcher.bio}</p>
              <div className="details-specializations">
                <h3>Specializations</h3>
                <ul>
                    {butcher.specializations.length
                      ? butcher.specializations.map((item) => <li key={item}>{item}</li>)
                      : <li>Not listed</li>}
                </ul>
              </div>
            </section>

            <section className="details-section" id="services" aria-labelledby="details-services-heading">
              <div className="details-section-heading">
                <div>
                  <p className="finder-eyebrow">Clear, upfront pricing</p>
                  <h2 id="details-services-heading">Services &amp; Pricing</h2>
                </div>
                <span className="details-currency-note">Prices in BDT</span>
              </div>
              <div className="details-service-list">
                {services.map((service) => (
                  <article className="details-service-row" key={service.id}>
                    <div className="details-service-copy">
                      <span className="details-service-animal">{service.animal}</span>
                      <h3>{service.name}</h3>
                      <p>{service.description}</p>
                    </div>
                    <div className="details-service-meta">
                      <strong>৳{service.price.toLocaleString('en-BD')}{service.animal === 'Shared Cow' ? ' / share' : ''}</strong>
                      <span>Estimated {service.duration}</span>
                      <span className={`details-service-availability ${service.availability === 'Available' ? 'is-available' : service.availability === 'Fully booked' ? 'is-unavailable' : 'is-limited'}`}>
                        {service.availability}
                      </span>
                    </div>
                      {canBook ? (
                        <Link className="details-service-book" to={bookingPath(service.id)}>Book This Service</Link>
                      ) : (
                        <button className="details-service-book" type="button" disabled>{bookingBlockMessage}</button>
                      )}
                  </article>
                ))}
              </div>
            </section>

            <section className="details-section" aria-labelledby="details-reviews-heading">
              <div className="details-section-heading">
                <div>
                  <p className="finder-eyebrow">Customer feedback</p>
                  <h2 id="details-reviews-heading">Reviews</h2>
                </div>
                <span className="details-review-total">{reviewCount} reviews</span>
              </div>
              <div className="details-rating-summary">
                <div className="details-rating-score">
                    <strong>{overallRating.toFixed(1)}</strong>
                    <StarRating rating={overallRating} />
                  <span>Based on customer reviews</span>
                </div>
                <div className="details-rating-bars" aria-label="Rating distribution">
                  {currentRatingDistribution.map((row) => (
                    <div className="details-rating-row" key={row.stars}>
                      <span>{row.stars} stars</span>
                      <span className="details-rating-track"><span style={{ width: `${row.percent}%` }} /></span>
                      <span>{row.percent}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="details-review-list">
                    {butcher.reviews.map((review) => (
                  <article className="details-review" key={review.id}>
                    <div className="details-review-topline">
                      <div>
                        <h3>{review.customer}</h3>
                        <StarRating rating={review.rating} label={`${review.rating} out of 5 stars`} />
                      </div>
                      <time>{review.date}</time>
                    </div>
                    <p className="details-review-service">{review.service}</p>
                    <p className="details-review-text">“{review.text}”</p>
                    {review.serviceRating ? <p className="details-review-categories">Service {review.serviceRating}/5 · Professionalism {review.professionalismRating}/5 · Punctuality {review.punctualityRating}/5 · Cleanliness {review.cleanlinessRating}/5</p> : null}
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside className="details-side-column">
            <section className="details-side-section" aria-labelledby="details-availability-heading">
              <p className="finder-eyebrow">Plan with confidence</p>
              <h2 id="details-availability-heading">Availability</h2>
              <p className={`details-current-status ${butcher.availability === 'Unavailable' ? 'is-unavailable' : ''}`}>
                <span aria-hidden="true" />{butcher.availability === 'Unavailable' ? 'Currently unavailable' : 'Available for bookings'}
              </p>
              <div className="details-schedule">
                {butcher.schedule.map(([day, hours]) => (
                  <div key={day}><strong>{day}</strong><span>{hours}</span></div>
                ))}
              </div>
            </section>

            <section className="details-side-section" aria-labelledby="details-areas-heading">
              <p className="finder-eyebrow">Local service</p>
              <h2 id="details-areas-heading">Service Areas</h2>
              <p className="details-area-lead">Serving {butcher.area}</p>
              <ul className="details-area-list">
                {butcher.serviceAreas.map((area) => <li key={area}>{area}</li>)}
              </ul>
            </section>

            <section className="details-side-section" aria-labelledby="details-contact-heading">
              <p className="finder-eyebrow">Service contact</p>
              <h2 id="details-contact-heading">Contact Information</h2>
              <dl className="details-contact-list">
                <div><dt>Phone</dt><dd>{butcher.phone}</dd></div>
                <div><dt>Primary area</dt><dd>{butcher.area}</dd></div>
              </dl>
            </section>
          </aside>
        </div>

        <section className="details-booking-cta" aria-labelledby="details-booking-heading">
          <div>
            <p className="finder-eyebrow">Next step</p>
            <h2 id="details-booking-heading">Ready to book this butcher?</h2>
            <p>Choose a service and continue to the booking preview.</p>
          </div>
          {canBook ? (
            <Link className="details-book-now" to={bookingPath(services[0]?.id || '')}>Choose a Service <span aria-hidden="true">→</span></Link>
          ) : (
            <span className="details-book-unavailable">{bookingBlockMessage}</span>
          )}
        </section>
      </main>
    </div>
  );
}

export function BookingPlaceholder() {
  const { butcherId } = useParams();
  const [searchParams] = useSearchParams();
  const butcher = butchers.find((item) => item.id === butcherId);
  const services = butcher ? getButcherServices(butcher) : [];
  const selectedService = services.find((item) => item.id === searchParams.get('service'));

  return (
    <div className="find-butcher-page butcher-details-page">
      <CustomerNavigation />
      <main className="butcher-details-main">
        <Link className="details-back-link" to={butcher ? `/dashboard/customer/find-butcher/${butcher.id}` : '/dashboard/customer/find-butcher'}>← Back to Butcher Profile</Link>
        <section className="details-booking-placeholder">
          <p className="finder-eyebrow">Booking preview</p>
          <h1>Booking is coming next</h1>
          {butcher && selectedService ? (
            <p>You selected <strong>{selectedService.name}</strong> with <strong>{butcher.name}</strong> for <strong>৳{selectedService.price.toLocaleString('en-BD')}</strong>.</p>
          ) : (
            <p>Your selected butcher and service will appear here when booking is available.</p>
          )}
          <p>No booking or payment has been created.</p>
          <Link className="finder-search-button" to={butcher ? `/dashboard/customer/find-butcher/${butcher.id}` : '/dashboard/customer/find-butcher'}>Return to profile</Link>
        </section>
      </main>
    </div>
  );
}

export default ButcherDetails;
