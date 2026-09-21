import { Icon } from './ButcherSidebar';

function ReviewDetails({ review, onClose }) {
  if (!review) return null;
  return <div className="review-detail-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><aside className="review-details" role="dialog" aria-modal="true" aria-labelledby="review-details-title"><div className="review-details-header"><div><p className="eyebrow">Review details</p><h2 id="review-details-title">Customer feedback</h2></div><button type="button" className="review-close" onClick={onClose} aria-label="Close review details"><Icon name="close" size={20} /></button></div><div className="review-detail-customer"><span className="review-avatar">{review.customer.split(' ').map((name) => name[0]).join('')}</span><div><strong>{review.customer}</strong><span>{review.date}</span></div></div><div className="review-detail-rating"><b>{stars(review.rating)}</b><span>{review.rating}.0 out of 5</span></div><div className="review-detail-group"><p className="eyebrow">Service</p><div><span>Service type</span><strong>{review.service}</strong></div><div><span>Animal</span><strong>{review.animal}</strong></div><div><span>Booking ID</span><strong>{review.bookingId}</strong></div></div><div className="review-detail-quote"><p className="eyebrow">Review</p><p>“{review.text}”</p></div><button type="button" className="outline-action review-close-button" onClick={onClose}>Close</button></aside></div>;
}

function stars(rating) {
  return `${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}`;
}

export default ReviewDetails;