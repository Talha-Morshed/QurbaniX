import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import { Icon } from '../../components/butcher/ButcherSidebar';
import ButcherSidebar from '../../components/butcher/ButcherSidebar';
import RatingHighlights from '../../components/butcher/RatingHighlights';
import RatingOverview from '../../components/butcher/RatingOverview';
import ReviewDetails from '../../components/butcher/ReviewDetails';
import ReviewFilters from '../../components/butcher/ReviewFilters';
import ReviewList from '../../components/butcher/ReviewList';
import '../dashboard/ButcherDashboard.css';
import './Reviews.css';

const subratingFields = [
  ['Professionalism', 'professionalismRating'],
  ['Punctuality', 'punctualityRating'],
  ['Service quality', 'serviceRating'],
  ['Cleanliness', 'cleanlinessRating'],
];

function mapReview(record) {
  const service = record.booking?.service || {};
  const timestamp = Date.parse(record.created_at || '');
  const date = Number.isNaN(timestamp)
    ? '—'
    : new Date(timestamp).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return {
    id: record.id,
    customer: record.customer?.name || 'Customer',
    rating: Number(record.rating),
    date,
    timestamp: Number.isNaN(timestamp) ? 0 : timestamp,
    service: service.name || 'Service',
    animal: service.animal || '—',
    bookingId: record.booking?.reference || '—',
    text: record.comment || '',
    serviceRating: record.service_rating,
    professionalismRating: record.professionalism_rating,
    punctualityRating: record.punctuality_rating,
    cleanlinessRating: record.cleanliness_rating,
    recommendation: record.recommendation,
    status: record.status,
  };
}

function summarizeReviews(reviews) {
  const total = reviews.length;
  const average = total
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / total
    : 0;
  const distribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((review) => review.rating === stars).length;
    return {
      stars,
      count,
      percentage: total ? Math.round((count / total) * 100) : 0,
    };
  });
  const highlights = subratingFields.map(([label, field]) => {
    const ratings = reviews
      .map((review) => Number(review[field]))
      .filter((rating) => Number.isFinite(rating) && rating >= 1 && rating <= 5);
    const value = ratings.length
      ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1)
      : null;
    return { label, value, count: ratings.length };
  });

  return { average, total, distribution, highlights };
}

function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Reviews');
  const [sort, setSort] = useState('Newest');
  const [selectedReview, setSelectedReview] = useState(null);

  const loadReviews = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const records = [];
      let page = 1;
      let lastPage = 1;
      do {
        const response = await api.butcherReviews({ per_page: 100, page });
        records.push(...(response.data || []));
        lastPage = response.last_page || 1;
        page += 1;
      } while (page <= lastPage);
      setReviews(records.map(mapReview));
    } catch (requestError) {
      setError(requestError.message || 'Unable to load reviews. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const summary = useMemo(() => summarizeReviews(reviews), [reviews]);
  const visibleReviews = useMemo(() => {
    const ratingFilter = activeFilter === 'All Reviews' ? null : Number(activeFilter[0]);
    return [...reviews]
      .filter((review) => !ratingFilter || review.rating === ratingFilter)
      .sort((first, second) => {
        if (sort === 'Oldest') return first.timestamp - second.timestamp;
        if (sort === 'Highest Rating') return second.rating - first.rating || second.timestamp - first.timestamp;
        if (sort === 'Lowest Rating') return first.rating - second.rating || second.timestamp - first.timestamp;
        return second.timestamp - first.timestamp;
      });
  }, [activeFilter, reviews, sort]);

  return <div className="butcher-dashboard reviews-page"><ButcherSidebar /><main className="butcher-main"><header className="butcher-topbar reviews-topbar"><div><p className="eyebrow">Butcher workspace</p><h1>Reviews</h1><p>See what customers are saying about your Qurbani services.</p></div><div className="butcher-user"><button type="button" className="butcher-notification" aria-label="View notifications"><Icon name="inbox" size={18} /><span className="notification-dot" /></button><span className="butcher-avatar">KA</span><div className="butcher-user-copy"><strong>Karim Ahmed</strong><span>Verified Butcher</span></div></div></header><div className="reviews-toolbar"><div><p className="eyebrow">Customer feedback</p><h2>Your reputation</h2></div><Link to="/dashboard/butcher" className="reviews-dashboard-link">← Dashboard</Link></div><div className="reviews-top-grid"><RatingOverview average={summary.average} count={summary.total} distribution={summary.distribution} /><RatingHighlights highlights={summary.highlights} /></div><ReviewFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} sort={sort} onSortChange={setSort} /><ReviewList reviews={visibleReviews} onView={setSelectedReview} isLoading={isLoading} error={error} onRetry={loadReviews} /></main><ReviewDetails review={selectedReview} onClose={() => setSelectedReview(null)} /></div>;
}

export default Reviews;
