import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import images from '../../assets/images';
import { api } from '../../api';
import { useAuth } from '../../auth/AuthContext';
import { getButcherFilterOptions, mapDirectoryButcher } from '../../utils/butcherDirectory';
import './FindButchers.css';

const initialSort = 'recommended';

export function CustomerNavigation() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const notificationOwnerId = user?.role === 'customer' ? String(user.id) : null;
  const [unreadCount, setUnreadCount] = useState(null);
  const [countOwnerId, setCountOwnerId] = useState(null);
  const [notificationCountError, setNotificationCountError] = useState(false);

  useEffect(() => {
    let isCurrentRequest = true;
    let requestNumber = 0;

    if (!notificationOwnerId) {
      setUnreadCount(null);
      setCountOwnerId(null);
      setNotificationCountError(false);
      return () => {
        isCurrentRequest = false;
      };
    }

    const loadUnreadCount = async () => {
      const currentRequest = ++requestNumber;
      try {
        let page = 1;
        let lastPage = 1;
        let count = 0;
        do {
          const response = await api.customerNotifications({ per_page: 100, page });
          count += (response.data || []).filter((notification) => !notification.read_at).length;
          lastPage = response.last_page || 1;
          page += 1;
        } while (page <= lastPage);
        if (isCurrentRequest && currentRequest === requestNumber) {
          setUnreadCount(count);
          setCountOwnerId(notificationOwnerId);
          setNotificationCountError(false);
        }
      } catch {
        if (isCurrentRequest && currentRequest === requestNumber) {
          setUnreadCount(null);
          setCountOwnerId(notificationOwnerId);
          setNotificationCountError(true);
        }
      }
    };

    const refreshAfterNotificationUpdate = () => {
      loadUnreadCount();
    };

    loadUnreadCount();
    window.addEventListener('customer-notifications-updated', refreshAfterNotificationUpdate);
    return () => {
      isCurrentRequest = false;
      window.removeEventListener('customer-notifications-updated', refreshAfterNotificationUpdate);
    };
  }, [notificationOwnerId, pathname]);

  const visibleUnreadCount = countOwnerId === notificationOwnerId ? unreadCount : null;
  const isCountUnavailable = countOwnerId === notificationOwnerId && notificationCountError;

  return (
    <header className="finder-nav">
      <div className="finder-nav-inner">
        <Link to="/" className="finder-brand" aria-label="QurbaniX home">
          <img src={images.logo} alt="" />
          <span>Qurbani<span className="finder-brand-x">X</span></span>
        </Link>
        <div className="finder-nav-actions">
          <nav className="finder-nav-links" aria-label="Customer navigation">
            <Link to="/dashboard/customer" aria-current={pathname === '/dashboard/customer' ? 'page' : undefined}>Dashboard</Link>
            <Link to="/dashboard/customer/find-butcher" aria-current={pathname.startsWith('/dashboard/customer/find-butcher') ? 'page' : undefined}>Find Butchers</Link>
            <Link to="/dashboard/customer/smart-match" aria-current={pathname === '/dashboard/customer/smart-match' ? 'page' : undefined}>Smart Match</Link>
            <Link to="/customer/bookings" aria-current={pathname.startsWith('/customer/bookings') ? 'page' : undefined}>Bookings</Link>
            <Link to="/customer/reviews" aria-current={pathname === '/customer/reviews' ? 'page' : undefined}>Reviews</Link>
            <Link to="/customer/profile" aria-current={pathname === '/customer/profile' ? 'page' : undefined}>Profile</Link>
          </nav>
          <Link className="finder-notification-link" to="/customer/notifications" aria-label={`Notifications${isCountUnavailable ? ', unread count unavailable' : visibleUnreadCount ? `, ${visibleUnreadCount} unread` : ''}`} aria-current={pathname === '/customer/notifications' ? 'page' : undefined}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg>
            {visibleUnreadCount ? <span className="finder-notification-count">{visibleUnreadCount > 9 ? '9+' : visibleUnreadCount}</span> : null}
          </Link>
        </div>
      </div>
    </header>
  );
}

export function VerifiedMark({ verified }) {
  return (
    <span className={`finder-verification ${verified ? 'is-verified' : 'is-pending'}`}>
      {verified ? (
        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m4.5 10.2 3.4 3.3 7.6-7.6" /></svg>
      ) : null}
      {verified ? 'Verified Butcher' : 'Verification pending'}
    </span>
  );
}

function ButcherCard({ butcher }) {
  return (
    <article className="butcher-card">
      <div className="butcher-card-heading">
        {butcher.image ? (
          <img className="butcher-avatar-image" src={butcher.image} alt={butcher.name} />
        ) : (
          <span className="butcher-avatar-initials">{butcher.initials}</span>
        )}
        <div className="butcher-card-person">
          <h3>{butcher.name}</h3>
          <VerifiedMark verified={butcher.verified} />
          <p className="butcher-card-location"><span aria-hidden="true">⌖</span> {butcher.area}</p>
        </div>
        <div className="butcher-price">
          <span>Starting from</span>
            <strong>{butcher.startingPrice == null ? 'Not listed' : `৳${butcher.startingPrice.toLocaleString('en-BD')}`}</strong>
        </div>
      </div>

      <div className="butcher-rating-line">
        <span className="butcher-star" aria-hidden="true">★</span>
        <strong>{butcher.rating.toFixed(1)}</strong>
        <span>{butcher.reviews} reviews</span>
        <span className="butcher-rating-separator" aria-hidden="true" />
        <span>{butcher.experience == null ? 'Experience not listed' : `${butcher.experience} years experience`}</span>
      </div>

      <div className="butcher-card-services">
        <div>
          <span className="butcher-detail-label">Animals</span>
          <div className="butcher-tags">
            {butcher.animals.map((animal) => <span key={animal}>{animal}</span>)}
          </div>
        </div>
        <div>
          <span className="butcher-detail-label">Services</span>
          <div className="butcher-services-list">{butcher.services.join(' · ')}</div>
        </div>
      </div>

      <div className="butcher-card-footer">
        <div className="butcher-availability">
          <span className={`availability-mark availability-${butcher.availability.toLowerCase().replace(' ', '-')}`} aria-hidden="true" />
          <strong>{butcher.availability}</strong>
          <span>{butcher.completedServices} completed services</span>
        </div>
        <Link className="butcher-profile-link" to={`/dashboard/customer/find-butcher/${butcher.id}`}>
          View Profile <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}

function FindButchers() {
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [service, setService] = useState('');
  const [animal, setAnimal] = useState('');
  const [minimumPrice, setMinimumPrice] = useState('');
  const [maximumPrice, setMaximumPrice] = useState('');
  const [minimumRating, setMinimumRating] = useState('');
  const [availability, setAvailability] = useState('');
  const [sortBy, setSortBy] = useState(initialSort);
  const [butchers, setButchers] = useState([]);
  const [filterOptions, setFilterOptions] = useState({ locations: [], services: [], animals: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [retryKey, setRetryKey] = useState(0);
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 });
  const filterOptionsLoaded = useRef(false);

  useEffect(() => {
    const filters = { page, per_page: 24, sort: sortBy };
    const search = searchTerm.trim();
    if (search) filters.search = search;
    if (location) {
      const selectedLocation = JSON.parse(location);
      if (selectedLocation.area) filters.area = selectedLocation.area;
      if (selectedLocation.city) filters.city = selectedLocation.city;
    }
    if (service) filters.service = service;
    if (animal) filters.animal = animal;
    if (minimumPrice) filters.minimum_price = minimumPrice;
    if (maximumPrice) filters.maximum_price = maximumPrice;
    if (minimumRating) filters.minimum_rating = minimumRating;
    if (availability === 'Available') filters.available = 1;

    let isCurrentRequest = true;
    setIsLoading(true);
    setError('');

    api.butchers(filters)
      .then((response) => {
        if (!isCurrentRequest) return;
        const records = response.data || [];
        setButchers(records.map(mapDirectoryButcher));
        setPagination({
          currentPage: Number(response.current_page) || 1,
          lastPage: Number(response.last_page) || 1,
          total: Number(response.total) || 0,
        });
        if (!filterOptionsLoaded.current) {
          setFilterOptions(getButcherFilterOptions(records));
          filterOptionsLoaded.current = true;
        }
      })
      .catch((requestError) => {
        if (!isCurrentRequest) return;
        setError(requestError?.message || 'Unable to load butchers. Please try again.');
        setButchers([]);
        setPagination({ currentPage: 1, lastPage: 1, total: 0 });
      })
      .finally(() => {
        if (isCurrentRequest) setIsLoading(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [animal, availability, location, maximumPrice, minimumPrice, minimumRating, page, retryKey, searchTerm, service, sortBy]);

  const clearFilters = () => {
    setSearchInput('');
    setSearchTerm('');
    setLocation('');
    setService('');
    setAnimal('');
    setMinimumPrice('');
    setMaximumPrice('');
    setMinimumRating('');
    setAvailability('');
    setSortBy(initialSort);
    setPage(1);
  };

  return (
    <div className="find-butcher-page">
      <CustomerNavigation />
      <main className="finder-main">
        <div className="finder-intro">
          <p className="finder-eyebrow">QurbaniX · Customer services</p>
          <h1>Find a Verified Butcher</h1>
          <p>Find trusted professionals, compare services and pricing, and choose the right butcher for your Qurbani.</p>
        </div>

        <form
          className="finder-search"
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            setSearchTerm(searchInput);
              setPage(1);
          }}
        >
          <label className="finder-field finder-search-text">
            <span>Search</span>
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by butcher, area, or service"
            />
          </label>
          <label className="finder-field">
            <span>Location</span>
            <select value={location} onChange={(event) => { setLocation(event.target.value); setPage(1); }}>
              <option value="">Select location</option>
              {filterOptions.locations.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          <label className="finder-field">
            <span>Service</span>
            <select value={service} onChange={(event) => { setService(event.target.value); setPage(1); }}>
              <option value="">Select service</option>
              {filterOptions.services.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <button className="finder-search-button" type="submit">Search</button>
        </form>

        <div className="finder-layout">
          <aside className="finder-filters" aria-labelledby="finder-filter-heading">
            <div className="finder-filter-heading">
              <div>
                <p className="finder-eyebrow">Refine results</p>
                <h2 id="finder-filter-heading">Filters</h2>
              </div>
              <button type="button" className="finder-clear" onClick={clearFilters}>Clear all</button>
            </div>

            <label className="finder-filter-field">
              <span>Animal</span>
              <select value={animal} onChange={(event) => { setAnimal(event.target.value); setPage(1); }}>
                <option value="">All animals</option>
                {filterOptions.animals.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>

            <fieldset className="finder-price-filter">
              <legend>Starting price (৳)</legend>
              <div className="finder-price-inputs">
                <label>
                  <span className="sr-only">Minimum price</span>
                  <input type="number" min="0" inputMode="numeric" placeholder="Min" value={minimumPrice} onChange={(event) => { setMinimumPrice(event.target.value); setPage(1); }} />
                </label>
                <span aria-hidden="true">to</span>
                <label>
                  <span className="sr-only">Maximum price</span>
                  <input type="number" min="0" inputMode="numeric" placeholder="Max" value={maximumPrice} onChange={(event) => { setMaximumPrice(event.target.value); setPage(1); }} />
                </label>
              </div>
            </fieldset>

            <label className="finder-filter-field">
              <span>Minimum rating</span>
              <select value={minimumRating} onChange={(event) => { setMinimumRating(event.target.value); setPage(1); }}>
                <option value="">Any rating</option>
                <option value="4.5">4.5+</option>
                <option value="4">4.0+</option>
                <option value="3.5">3.5+</option>
              </select>
            </label>

            <label className="finder-filter-field">
              <span>Availability</span>
              <select value={availability} onChange={(event) => { setAvailability(event.target.value); setPage(1); }}>
                <option value="">Any availability</option>
                <option value="Available">Available</option>
              </select>
            </label>

            <label className="finder-verified-toggle">
              <input type="checkbox" checked disabled />
              <span className="finder-checkbox" aria-hidden="true" />
              <span><strong>Verified only</strong><small>Show approved professionals</small></span>
            </label>
          </aside>

          <section className="finder-results" aria-labelledby="finder-results-heading">
            <div className="finder-results-heading">
              <div>
                <p className="finder-eyebrow">Trusted local professionals</p>
                <h2 id="finder-results-heading" aria-live="polite">
                  {pagination.total} {pagination.total === 1 ? 'butcher' : 'butchers'} found
                </h2>
              </div>
              <label className="finder-sort">
                <span>Sort by</span>
                <select value={sortBy} onChange={(event) => { setSortBy(event.target.value); setPage(1); }}>
                  <option value="recommended">Recommended</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price-low">Lowest Price</option>
                  <option value="price-high">Highest Price</option>
                  <option value="completed">Most Completed Services</option>
                </select>
              </label>
            </div>

            {isLoading ? (
              <div className="finder-empty-state" role="status"><h3>Loading butchers</h3><p>Fetching verified professionals from the directory.</p></div>
            ) : error ? (
              <div className="finder-empty-state" role="alert">
                <h3>Unable to load butchers</h3>
                <p>{error}</p>
                <button type="button" className="finder-search-button" onClick={() => setRetryKey((current) => current + 1)}>Try again</button>
              </div>
            ) : butchers.length > 0 ? (
              <div className="butcher-results-grid">
                {butchers.map((butcher) => <ButcherCard key={butcher.id} butcher={butcher} />)}
              </div>
            ) : (
              <div className="finder-empty-state">
                <span className="finder-empty-mark" aria-hidden="true">0</span>
                <h3>No verified butchers found</h3>
                <p>Try changing your search or filters.</p>
                <button type="button" className="finder-search-button" onClick={clearFilters}>Clear filters</button>
              </div>
            )}

            {!isLoading && !error && pagination.lastPage > 1 ? (
              <nav aria-label="Butcher directory pages" className="finder-pagination">
                <button type="button" className="finder-search-button" disabled={pagination.currentPage <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</button>
                <span>Page {pagination.currentPage} of {pagination.lastPage}</span>
                <button type="button" className="finder-search-button" disabled={pagination.currentPage >= pagination.lastPage} onClick={() => setPage((current) => Math.min(pagination.lastPage, current + 1))}>Next</button>
              </nav>
            ) : null}
          </section>
        </div>
      </main>
    </div>
  );
}

export default FindButchers;
