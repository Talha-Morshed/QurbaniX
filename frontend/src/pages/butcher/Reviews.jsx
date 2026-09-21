import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../components/butcher/ButcherSidebar';
import ButcherSidebar from '../../components/butcher/ButcherSidebar';
import RatingHighlights from '../../components/butcher/RatingHighlights';
import RatingOverview from '../../components/butcher/RatingOverview';
import ReviewDetails from '../../components/butcher/ReviewDetails';
import ReviewFilters from '../../components/butcher/ReviewFilters';
import ReviewList from '../../components/butcher/ReviewList';
import { ratingDistribution, ratingHighlights, reviewData } from '../../components/butcher/reviewsData';
import '../dashboard/ButcherDashboard.css';
import './Reviews.css';

function Reviews() {
  const [activeFilter, setActiveFilter] = useState('All Reviews');
  const [sort, setSort] = useState('Newest');
  const [selectedReview, setSelectedReview] = useState(null);

  const visibleReviews = useMemo(() => {
    const ratingFilter = activeFilter === 'All Reviews' ? null : Number(activeFilter[0]);
    return [...reviewData].filter((review) => !ratingFilter || review.rating === ratingFilter).sort((first, second) => {
      if (sort === 'Oldest') return first.timestamp - second.timestamp;
      if (sort === 'Highest Rating') return second.rating - first.rating || second.timestamp - first.timestamp;
      if (sort === 'Lowest Rating') return first.rating - second.rating || second.timestamp - first.timestamp;
      return second.timestamp - first.timestamp;
    });
  }, [activeFilter, sort]);

  return <div className="butcher-dashboard reviews-page"><ButcherSidebar /><main className="butcher-main"><header className="butcher-topbar reviews-topbar"><div><p className="eyebrow">Butcher workspace</p><h1>Reviews</h1><p>See what customers are saying about your Qurbani services.</p></div><div className="butcher-user"><button type="button" className="butcher-notification" aria-label="View notifications"><Icon name="inbox" size={18} /><span className="notification-dot" /></button><span className="butcher-avatar">KA</span><div className="butcher-user-copy"><strong>Karim Ahmed</strong><span>Verified Butcher</span></div></div></header><div className="reviews-toolbar"><div><p className="eyebrow">Customer feedback</p><h2>Your reputation</h2></div><Link to="/dashboard/butcher" className="reviews-dashboard-link">← Dashboard</Link></div><div className="reviews-top-grid"><RatingOverview distribution={ratingDistribution} /><RatingHighlights highlights={ratingHighlights} /></div><ReviewFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} sort={sort} onSortChange={setSort} /><ReviewList reviews={visibleReviews} onView={setSelectedReview} /></main><ReviewDetails review={selectedReview} onClose={() => setSelectedReview(null)} /></div>;
}

export default Reviews;