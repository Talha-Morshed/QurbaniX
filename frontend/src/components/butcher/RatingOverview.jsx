function RatingOverview({ average, count, distribution }) {
  const displayRating = count ? average.toFixed(1) : '—';
  const stars = '★'.repeat(Math.round(average)) + '☆'.repeat(5 - Math.round(average));
  return <section className="reviews-overview butcher-panel"><div className="review-score"><p className="eyebrow">Overall rating</p><strong>{displayRating} <span>/ 5</span></strong><div className="review-stars" aria-label={count ? `${displayRating} out of 5 stars` : 'No ratings yet'}>{stars}</div><p>Based on {count} {count === 1 ? 'review' : 'reviews'}</p></div><div className="rating-distribution">{distribution.map((item) => <div className="rating-bar-row" key={item.stars}><span>{item.stars} ★</span><div><i style={{ width: `${item.percentage}%` }} /></div><strong>{item.percentage}%</strong></div>)}</div></section>;
}

export default RatingOverview;