import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../api';
import { mapApiBooking, mapApiReview } from '../../utils/apiBookings';
import { CustomerNavigation, VerifiedMark } from './FindButchers';
import './CustomerReviews.css';

const categories = [
  ['serviceRating', 'Service quality'],
  ['professionalismRating', 'Professionalism'],
  ['punctualityRating', 'Punctuality'],
  ['cleanlinessRating', 'Cleanliness'],
];
const commentLimit = 600;

function formatDate(date) {
  if (!date) return 'Not provided';
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-BD', { day: 'numeric', month: 'long', year: 'numeric' });
}

function RatingStars({ label, rating, onChange, disabled = false }) {
  const [hoverRating, setHoverRating] = useState(0);
  const displayRating = hoverRating || rating;
  return (
    <fieldset className="customer-review-rating" onMouseLeave={() => setHoverRating(0)}>
      <legend>{label}</legend>
      <div className="customer-review-star-row" role="group" aria-label={`${label} rating`}>
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            className={value <= displayRating ? 'is-selected' : ''}
            type="button"
            key={value}
            aria-label={`${value} star${value === 1 ? '' : 's'}`}
            aria-pressed={rating === value}
            disabled={disabled}
            onMouseEnter={() => setHoverRating(value)}
            onFocus={() => setHoverRating(value)}
            onBlur={() => setHoverRating(0)}
            onClick={() => onChange(value)}
          >
            ★
          </button>
        ))}
      </div>
      <span className="customer-review-rating-value">{rating ? `${rating}.0 / 5` : 'Select a rating'}</span>
    </fieldset>
  );
}

function ReviewContext({ booking }) {
  return (
    <section className="customer-review-context">
      {booking.butcherImage ? <img src={booking.butcherImage} alt={booking.butcherName} /> : <span>{booking.butcherInitials}</span>}
      <div className="customer-review-context-copy">
        <h2>{booking.butcherName}</h2>
        <VerifiedMark verified={booking.butcherVerified} />
        <p>{booking.serviceName} · {booking.reference}</p>
        <small>Completed {formatDate(booking.completedDate || booking.date)}</small>
      </div>
    </section>
  );
}

function ReviewForm({ booking, onSubmit, form, setForm, error, isSubmitting }) {
  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  return (
    <form className="customer-review-form" onSubmit={onSubmit}>
      <RatingStars label="Overall rating" rating={form.rating} onChange={(rating) => setField('rating', rating)} />
      <div className="customer-review-category-grid">
        {categories.map(([field, label]) => (
          <RatingStars key={field} label={label} rating={form[field]} onChange={(rating) => setField(field, rating)} />
        ))}
      </div>
      <label className="customer-review-comment">
        <span>Comment <b>*</b></span>
        <textarea
          rows="5"
          maxLength={commentLimit}
          value={form.comment}
          onChange={(event) => setField('comment', event.target.value)}
          placeholder={`Share what went well with ${booking.butcherName}'s service. Your feedback helps other customers choose with confidence.`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'customer-review-error customer-review-count' : 'customer-review-count'}
        />
        <small id="customer-review-count">{form.comment.length}/{commentLimit} characters</small>
        {error ? <small id="customer-review-error" className="customer-review-error" role="alert">{error}</small> : null}
      </label>
      <fieldset className="customer-review-recommend">
        <legend>Would you recommend this butcher? <span>(optional)</span></legend>
        <label><input type="radio" name="recommend" value="yes" checked={form.recommended === 'yes'} onChange={() => setField('recommended', 'yes')} /> Yes</label>
        <label><input type="radio" name="recommend" value="no" checked={form.recommended === 'no'} onChange={() => setField('recommended', 'no')} /> No</label>
      </fieldset>
      <div className="customer-review-form-actions">
        <Link className="booking-secondary-button" to={`/customer/bookings/${encodeURIComponent(booking.id)}`}>Back to Booking</Link>
        <button className="booking-primary-button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit Review'}</button>
      </div>
    </form>
  );
}

function ReviewSuccess({ booking, review }) {
  return (
    <section className="customer-review-success">
      <p className="finder-eyebrow">Review submitted</p>
      <h2>Thank you for your review!</h2>
      <p>Your feedback for {booking.butcherName} has been saved and is now visible on the butcher profile.</p>
      <div className="customer-review-success-rating"><span aria-label={`${review.rating} out of 5 stars`}>{'★'.repeat(review.rating)}<span>{'★'.repeat(5 - review.rating)}</span></span><strong>{review.rating}.0 / 5</strong></div>
      <p className="customer-review-success-status">Review submitted successfully · {review.status}</p>
      <div className="customer-review-form-actions">
        <Link className="booking-primary-button" to={`/dashboard/customer/find-butcher/${booking.butcherId}`}>View Butcher</Link>
        <Link className="booking-secondary-button" to="/customer/bookings">Back to Booking History</Link>
      </div>
    </section>
  );
}

export function CustomerReviewFormPage() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [form, setForm] = useState({ rating: 0, serviceRating: 0, professionalismRating: 0, punctualityRating: 0, cleanlinessRating: 0, comment: '', recommended: '' });
  const [savedReview, setSavedReview] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let isCurrentRequest = true;
    setIsLoading(true);
    setLoadError('');

    api.customerBooking(bookingId)
      .then((response) => {
        if (!isCurrentRequest) return;
        const record = response.booking;
        const mappedBooking = mapApiBooking(record);
        setBooking(mappedBooking);
        setSavedReview(mappedBooking.review);
        if (mappedBooking.review) {
          setForm({
            rating: mappedBooking.review.rating,
            serviceRating: mappedBooking.review.serviceRating,
            professionalismRating: mappedBooking.review.professionalismRating,
            punctualityRating: mappedBooking.review.punctualityRating,
            cleanlinessRating: mappedBooking.review.cleanlinessRating,
            comment: mappedBooking.review.comment,
            recommended: mappedBooking.review.recommended,
          });
        }
      })
      .catch((requestError) => {
        if (isCurrentRequest) setLoadError(requestError?.message || 'This booking is not available for review.');
      })
      .finally(() => {
        if (isCurrentRequest) setIsLoading(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [bookingId, retryKey]);

  const submitReview = async (event) => {
    event.preventDefault();
    if (!form.rating) {
      setError('Select an overall rating to continue.');
      return;
    }
    if (form.comment.trim().length < 5) {
      setError('Add a comment with at least 5 characters.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      const response = await api.createReview(booking.id, {
        rating: form.rating,
        service_rating: form.serviceRating || null,
        professionalism_rating: form.professionalismRating || null,
        punctuality_rating: form.punctualityRating || null,
        cleanliness_rating: form.cleanlinessRating || null,
        comment: form.comment.trim(),
        recommendation: form.recommended || null,
      });
      setSavedReview(mapApiReview(response.review));
    } catch (requestError) {
      const validationMessage = Object.values(requestError?.errors || {}).flat()[0];
      setError(requestError?.status === 409
        ? 'This booking already has a review.'
        : validationMessage || requestError?.message || 'Unable to submit your review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="find-butcher-page customer-reviews-page"><CustomerNavigation /><main className="customer-reviews-main"><p role="status">Loading booking...</p></main></div>;
  }

  if (!booking || booking.status !== 'Completed') {
    return <ReviewNotFound message={loadError || 'Only completed bookings can be reviewed.'} onRetry={loadError ? () => setRetryKey((current) => current + 1) : null} />;
  }

  return (
    <div className="find-butcher-page customer-reviews-page">
      <CustomerNavigation />
      <main className="customer-reviews-main">
        <Link className="details-back-link" to={`/customer/bookings/${encodeURIComponent(booking.id)}`}>← Booking details</Link>
        <header className="customer-reviews-heading"><p className="finder-eyebrow">Customer feedback</p><h1>{savedReview ? 'Review Submitted' : 'Leave a Review'}</h1></header>
        <ReviewContext booking={booking} />
        {savedReview ? <ReviewSuccess booking={booking} review={savedReview} /> : <ReviewForm booking={booking} onSubmit={submitReview} form={form} setForm={setForm} error={error} isSubmitting={isSubmitting} />}
      </main>
    </div>
  );
}

export function MyReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let isCurrentRequest = true;
    setIsLoading(true);
    setError('');
    api.customerReviews({ per_page: 100 })
      .then((response) => {
        if (isCurrentRequest) setReviews((response.data || []).map((review) => mapApiReview(review)));
      })
      .catch((requestError) => {
        if (!isCurrentRequest) return;
        setReviews([]);
        setError(requestError?.message || 'Unable to load your reviews.');
      })
      .finally(() => {
        if (isCurrentRequest) setIsLoading(false);
      });
    return () => {
      isCurrentRequest = false;
    };
  }, [retryKey]);

  return (
    <div className="find-butcher-page customer-reviews-page">
      <CustomerNavigation />
      <main className="customer-reviews-main">
        <Link className="details-back-link" to="/dashboard/customer">← Customer home</Link>
        <header className="customer-reviews-heading"><p className="finder-eyebrow">Customer account</p><h1>My Reviews</h1><p>{reviews.length} review{reviews.length === 1 ? '' : 's'}</p></header>
        {isLoading ? <p role="status">Loading reviews...</p> : null}
        {!isLoading && error ? <section className="customer-my-reviews-empty" role="alert"><p>{error}</p><button className="booking-secondary-button" type="button" onClick={() => setRetryKey((current) => current + 1)}>Try again</button></section> : null}
        {!isLoading && !error && reviews.length ? (
          <section className="customer-my-reviews-list">
            {reviews.map((review) => (
              <article className="customer-my-review" key={review.id}>
                <div className="customer-my-review-heading"><div><p className="customer-review-reference">{review.reference}</p><h2>{review.butcherName}</h2></div><span className={`customer-review-status ${review.status === 'Published' ? 'is-published' : ''}`}>{review.status}</span></div>
                <div className="customer-my-review-rating"><span>{'★'.repeat(review.rating)}<span>{'★'.repeat(5 - review.rating)}</span></span><strong>{review.rating}.0 / 5</strong><time>{review.date}</time></div>
                <p className="customer-my-review-service">{review.service}</p>
                <p className="customer-my-review-comment">“{review.comment}”</p>
                <dl className="customer-my-review-categories">{categories.map(([field, label]) => <div key={field}><dt>{label}</dt><dd>{review[field]}.0 / 5</dd></div>)}</dl>
                <Link className="booking-secondary-button" to={`/dashboard/customer/find-butcher/${review.butcherId}`}>View Butcher</Link>
              </article>
            ))}
          </section>
        ) : null}
        {!isLoading && !error && !reviews.length ? (
          <section className="customer-my-reviews-empty"><h2>No reviews yet</h2><p>After a completed booking, you can leave a review from its booking details.</p><Link className="booking-primary-button" to="/customer/bookings">Go to Booking History</Link></section>
        ) : null}
      </main>
    </div>
  );
}

function ReviewNotFound({ message, onRetry }) {
  return <div className="find-butcher-page customer-reviews-page"><CustomerNavigation /><main className="customer-reviews-main"><section className="customer-my-reviews-empty"><h1>Review unavailable</h1><p>{message}</p>{onRetry ? <button className="booking-secondary-button" type="button" onClick={onRetry}>Try again</button> : null}<Link className="booking-primary-button" to="/customer/bookings">Go to Booking History</Link></section></main></div>;
}
