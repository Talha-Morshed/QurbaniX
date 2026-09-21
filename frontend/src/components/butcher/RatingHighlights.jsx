function RatingHighlights({ highlights }) {
  return <section className="butcher-panel rating-highlights"><div className="panel-heading"><div><p className="eyebrow">What customers value</p><h2>Rating highlights</h2></div></div><div className="highlight-list">{highlights.map(([label, value]) => <div className="highlight-row" key={label}><span>{label}</span><strong>{value} <small>/ 5</small></strong></div>)}</div></section>;
}

export default RatingHighlights;