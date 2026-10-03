import { Icon } from './ButcherSidebar';

function ReviewDetails({ review, onClose }) {
  if (!review) return null;
  const subratings = [
    ['Service quality', review.serviceRating],
    ['Professionalism', review.professionalismRating],
    ['Punctuality', review.punctualityRating],
    ['Cleanliness', review.cleanlinessRating],
  ].filter(([, rating]) => rating !== null && rating !== undefined);

  return <div className="review-detail-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><aside className="review-details" role="dialog" aria-modal="true" aria-labelledby="review-details-title"><div className="review-details-header"><div><p className="eyebrow">Review details</p><h2 id="review-details-title">Customer feedback</h2></div><button type="button" className="review-close" onClick={onClose} aria-label="Close review details"><Icon name="close" size={20} /></button></div><div className="review-detail-customer"><span className="review-avatar">{initials(review.customer)}</span><div><strong>{review.customer}</strong><span>{review.date}</span></div></div><div className="review-detail-rating"><b>{stars(review.rating)}</b><span>{review.rating.toFixed(1)} out of 5</span></div><div className="review-detail-group"><p className="eyebrow">Service</p><div><span>Service type</span><strong>{review.service}</strong></div><div><span>Animal</span><strong>{review.animal}</strong></div><div><span>Booking reference</span><strong>{review.bookingId}</strong></div></div>{subratings.length > 0 && <div className="review-detail-group"><p className="eyebrow">Service ratings</p>{subratings.map(([label, rating]) => <div key={label}><span>{label}</span><strong>{Number(rating).toFixed(1)} / 5</strong></div>)}</div>}{review.recommendation && <div className="review-detail-group"><p className="eyebrow">Recommendation</p><div><span>Would recommend</span><strong>{review.recommendation === 'yes' ? 'Yes' : 'No'}</strong></div></div>}<div className="review-detail-quote"><p className="eyebrow">Review</p><p>“{review.text}”</p></div><button type="button" className="outline-action review-close-button" onClick={onClose}>Close</button></aside></div>;
}

function stars(rating) {
  return `${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}`;
}

function initials(name) {
  return name.split(/\s+/).filter(Boolean).map((part) => part[0]).join('');
}

export default ReviewDetails;