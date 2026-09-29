import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import images from '../../assets/images';
import {
  butcherAnimals,
  butcherLocations,
  butcherServices,
  butchers,
} from '../../components/customer/butchersData';
import './FindButchers.css';

const initialSort = 'recommended';

export function CustomerNavigation() {
  const { pathname } = useLocation();
  return (
    <header className="finder-nav">
      <div className="finder-nav-inner">
        <Link to="/" className="finder-brand" aria-label="QurbaniX home">
          <img src={images.logo} alt="" />
          <span>Qurbani<span className="finder-brand-x">X</span></span>
        </Link>
        <nav className="finder-nav-links" aria-label="Customer navigation">
          <Link to="/dashboard/customer" aria-current={pathname === '/dashboard/customer' ? 'page' : undefined}>Dashboard</Link>
          <Link to="/dashboard/customer/find-butcher" aria-current={pathname.startsWith('/dashboard/customer/find-butcher') ? 'page' : undefined}>Find Butchers</Link>
          <Link to="/customer/bookings" aria-current={pathname.startsWith('/customer/bookings') ? 'page' : undefined}>Bookings</Link>
          <Link to="/customer/reviews" aria-current={pathname === '/customer/reviews' ? 'page' : undefined}>Reviews</Link>
          <Link to="/customer/profile" aria-current={pathname === '/customer/profile' ? 'page' : undefined}>Profile</Link>
        </nav>
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
          <strong>৳{butcher.startingPrice.toLocaleString('en-BD')}</strong>
        </div>
      </div>

      <div className="butcher-rating-line">
        <span className="butcher-star" aria-hidden="true">★</span>
        <strong>{butcher.rating.toFixed(1)}</strong>
        <span>{butcher.reviews} reviews</span>
        <span className="butcher-rating-separator" aria-hidden="true" />
        <span>{butcher.experience} years experience</span>
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
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [sortBy, setSortBy] = useState(initialSort);

  const matchingButchers = butchers.filter((butcher) => {
    const searchText = searchTerm.trim().toLowerCase();
    const searchableText = [butcher.name, butcher.area, ...butcher.animals, ...butcher.services]
      .join(' ')
      .toLowerCase();

    return (!searchText || searchableText.includes(searchText))
      && (!location || butcher.area === location)
      && (!service || butcher.services.includes(service))
      && (!animal || butcher.animals.includes(animal))
      && (!minimumPrice || butcher.startingPrice >= Number(minimumPrice))
      && (!maximumPrice || butcher.startingPrice <= Number(maximumPrice))
      && (!minimumRating || butcher.rating >= Number(minimumRating))
      && (!availability || butcher.availability === availability)
      && (!verifiedOnly || butcher.verified);
  });

  const visibleButchers = [...matchingButchers].sort((first, second) => {
    if (sortBy === 'rating') return second.rating - first.rating;
    if (sortBy === 'price-low') return first.startingPrice - second.startingPrice;
    if (sortBy === 'price-high') return second.startingPrice - first.startingPrice;
    if (sortBy === 'completed') return second.completedServices - first.completedServices;
    return Number(second.recommended) - Number(first.recommended) || second.rating - first.rating;
  });

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
    setVerifiedOnly(true);
    setSortBy(initialSort);
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
            <select value={location} onChange={(event) => setLocation(event.target.value)}>
              <option value="">Select location</option>
              {butcherLocations.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="finder-field">
            <span>Service</span>
            <select value={service} onChange={(event) => setService(event.target.value)}>
              <option value="">Select service</option>
              {butcherServices.map((item) => <option key={item} value={item}>{item}</option>)}
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
              <select value={animal} onChange={(event) => setAnimal(event.target.value)}>
                <option value="">All animals</option>
                {butcherAnimals.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>

            <fieldset className="finder-price-filter">
              <legend>Starting price (৳)</legend>
              <div className="finder-price-inputs">
                <label>
                  <span className="sr-only">Minimum price</span>
                  <input type="number" min="0" inputMode="numeric" placeholder="Min" value={minimumPrice} onChange={(event) => setMinimumPrice(event.target.value)} />
                </label>
                <span aria-hidden="true">to</span>
                <label>
                  <span className="sr-only">Maximum price</span>
                  <input type="number" min="0" inputMode="numeric" placeholder="Max" value={maximumPrice} onChange={(event) => setMaximumPrice(event.target.value)} />
                </label>
              </div>
            </fieldset>

            <label className="finder-filter-field">
              <span>Minimum rating</span>
              <select value={minimumRating} onChange={(event) => setMinimumRating(event.target.value)}>
                <option value="">Any rating</option>
                <option value="4.5">4.5+</option>
                <option value="4">4.0+</option>
                <option value="3.5">3.5+</option>
              </select>
            </label>

            <label className="finder-filter-field">
              <span>Availability</span>
              <select value={availability} onChange={(event) => setAvailability(event.target.value)}>
                <option value="">Any availability</option>
                <option value="Available">Available</option>
                <option value="Limited slots">Limited slots</option>
                <option value="Unavailable">Unavailable</option>
              </select>
            </label>

            <label className="finder-verified-toggle">
              <input type="checkbox" checked={verifiedOnly} onChange={(event) => setVerifiedOnly(event.target.checked)} />
              <span className="finder-checkbox" aria-hidden="true" />
              <span><strong>Verified only</strong><small>Show approved professionals</small></span>
            </label>
          </aside>

          <section className="finder-results" aria-labelledby="finder-results-heading">
            <div className="finder-results-heading">
              <div>
                <p className="finder-eyebrow">Trusted local professionals</p>
                <h2 id="finder-results-heading" aria-live="polite">
                  {visibleButchers.length} {visibleButchers.length === 1 ? 'butcher' : 'butchers'} found
                </h2>
              </div>
              <label className="finder-sort">
                <span>Sort by</span>
                <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                  <option value="recommended">Recommended</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price-low">Lowest Price</option>
                  <option value="price-high">Highest Price</option>
                  <option value="completed">Most Completed Services</option>
                </select>
              </label>
            </div>

            {visibleButchers.length > 0 ? (
              <div className="butcher-results-grid">
                {visibleButchers.map((butcher) => <ButcherCard key={butcher.id} butcher={butcher} />)}
              </div>
            ) : (
              <div className="finder-empty-state">
                <span className="finder-empty-mark" aria-hidden="true">0</span>
                <h3>No verified butchers found</h3>
                <p>Try changing your search or filters.</p>
                <button type="button" className="finder-search-button" onClick={clearFilters}>Clear filters</button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default FindButchers;
