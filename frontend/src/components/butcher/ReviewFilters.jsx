const reviewFilters = ['All Reviews', '5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star'];

function ReviewFilters({ activeFilter, onFilterChange, sort, onSortChange }) {
  return <section className="reviews-filters butcher-panel"><div className="review-filter-tabs" role="tablist">{reviewFilters.map((filter) => <button key={filter} type="button" role="tab" aria-selected={activeFilter === filter} className={activeFilter === filter ? 'is-active' : ''} onClick={() => onFilterChange(filter)}>{filter}</button>)}</div><label className="review-sort">Sort by<select value={sort} onChange={(event) => onSortChange(event.target.value)}><option>Newest</option><option>Oldest</option><option>Highest Rating</option><option>Lowest Rating</option></select></label></section>;
}

export default ReviewFilters;