function RatingOverview({ distribution }) {
  return <section className="reviews-overview butcher-panel"><div className="review-score"><p className="eyebrow">Overall rating</p><strong>4.9 <span>/ 5</span></strong><div className="review-stars" aria-label="4.9 out of 5 stars">★★★★★</div><p>Based on 342 reviews</p></div><div className="rating-distribution">{distribution.map((item) => <div className="rating-bar-row" key={item.stars}><span>{item.stars} ★</span><div><i style={{ width: `${item.percentage}%` }} /></div><strong>{item.percentage}%</strong></div>)}</div></section>;
}

export default RatingOverview;