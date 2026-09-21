function stars(rating) {
  return `${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}`;
}

function ReviewList({ reviews, onView }) {
  return <section className="butcher-panel review-list-panel"><div className="panel-heading"><div><p className="eyebrow">Customer feedback</p><h2>Recent reviews <span className="review-count">{reviews.length}</span></h2></div><span className="review-list-note">Reviews from completed services</span></div><div className="review-list">{reviews.map((review) => <article className="review-row" key={review.id}><div className="review-avatar">{review.customer.split(' ').map((name) => name[0]).join('')}</div><div className="review-copy"><div className="review-heading"><strong>{review.customer}</strong><span>{review.date}</span></div><div className="review-rating"><b>{stars(review.rating)}</b><span>{review.rating}.0</span></div><p>{review.text}</p><div className="review-meta"><span>{review.service}</span><i /> <span>{review.animal}</span><i /> <span>{review.bookingId}</span></div></div><button type="button" className="row-action review-view" onClick={() => onView(review)} aria-label={`View review from ${review.customer}`}>•••</button></article>)}</div>{!reviews.length && <div className="review-empty"><strong>No reviews yet</strong><span>Customer reviews will appear here after completed services.</span></div>}</section>;
}

export default ReviewList;