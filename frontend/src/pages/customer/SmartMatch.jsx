import { useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { CustomerNavigation, VerifiedMark } from './FindButchers';
import './FindButchers.css';
import './SmartMatch.css';

const animalOptions = [
  ['goat', 'Goat'],
  ['cow', 'Cow'],
  ['sheep', 'Sheep'],
  ['camel', 'Camel'],
];

const initialPreferences = {
  animal_type: 'goat',
  area: '',
  city: '',
  date: '',
  time: '',
  max_budget: '',
  min_rating: '',
  service_category: '',
};

function localDateString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

function getErrorMessage(error) {
  const validationMessage = Object.values(error?.errors || {}).flat()[0];
  return validationMessage || error?.message || 'Unable to find matches. Please try again.';
}

function initialsFor(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0] || '').join('').toUpperCase();
}

function MatchCard({ match }) {
  const butcher = match.butcher || {};
  const profile = match.profile || {};
  const service = match.service || {};
  const availability = match.availability || {};
  const location = [profile.area, profile.city].filter(Boolean).join(', ') || 'Location not provided';
  const price = Number(service.price);

  return (
    <article className="butcher-card smart-match-card">
      <div className="butcher-card-heading">
        <span className="butcher-avatar-initials">{initialsFor(butcher.name)}</span>
        <div className="butcher-card-person">
          <h3>{butcher.name}</h3>
          <VerifiedMark verified />
          <p className="butcher-card-location"><span aria-hidden="true">⌖</span> {location}</p>
        </div>
        <div className="butcher-price smart-match-score">
          <span>Match score</span>
          <strong>{match.match_score} pts</strong>
          <small>Based on your preferences</small>
        </div>
      </div>

      <div className="butcher-rating-line">
        <span className="butcher-star" aria-hidden="true">★</span>
        <strong>{match.rating == null ? 'No rating yet' : Number(match.rating).toFixed(1)}</strong>
        {match.rating == null ? null : <span>{match.review_count} reviews</span>}
      </div>

      <div className="smart-match-service">
        <span className="butcher-detail-label">Matching service</span>
        <strong>{service.name}</strong>
        <span>{service.animal} · {service.category}</span>
        <b>{Number.isFinite(price) ? `৳${price.toLocaleString('en-BD')}` : 'Price not listed'}</b>
      </div>

      <div className="smart-match-availability" aria-label="Requested availability">
        <span className={`availability-mark ${availability.is_available ? 'availability-available' : 'availability-unavailable'}`} aria-hidden="true" />
        <strong>{availability.is_available ? 'Available for your request' : 'Unavailable for your request'}</strong>
        {availability.starts_at && availability.ends_at ? <span>{availability.starts_at}–{availability.ends_at}</span> : null}
      </div>

      <div className="smart-match-reasons">
        <span className="butcher-detail-label">Why this match</span>
        <ul>
          {(match.match_reasons || []).map((reason, index) => <li key={`${reason}-${index}`}>{reason}</li>)}
        </ul>
      </div>

      <div className="butcher-card-footer">
        <div className="butcher-availability">
          <strong>{availability.remaining_capacity == null ? 'Capacity not listed' : `${availability.remaining_capacity} slots remaining`}</strong>
        </div>
        <Link className="butcher-profile-link" to={`/dashboard/customer/find-butcher/${encodeURIComponent(butcher.id)}`}>
          View Profile <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}

function SmartMatch() {
  const location = useLocation();
  const navigate = useNavigate();
  const savedMatch = location.state?.smartMatch;
  const [preferences, setPreferences] = useState(() => ({
    ...initialPreferences,
    ...(savedMatch?.preferences || {}),
  }));
  const [matches, setMatches] = useState(() => (
    Array.isArray(savedMatch?.matches) ? savedMatch.matches : null
  ));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(() => Boolean(savedMatch));
  const formRef = useRef(null);
  const animalRef = useRef(null);

  const updatePreference = (event) => {
    const { name, value } = event.target;
    const updatedPreferences = { ...preferences, [name]: value };
    setPreferences(updatedPreferences);
    setMatches(null);
    setHasSubmitted(false);
    setError('');
    if (location.state?.smartMatch) {
      navigate(location.pathname, {
        replace: true,
        state: {
          ...location.state,
          smartMatch: { preferences: updatedPreferences, matches: null },
        },
      });
    }
  };

  const submitPreferences = async (event) => {
    event.preventDefault();
    setError('');
    setMatches(null);
    setHasSubmitted(true);
    setIsSubmitting(true);

    const payload = {
      animal_type: preferences.animal_type,
      date: preferences.date,
      ...(preferences.area.trim() ? { area: preferences.area.trim() } : {}),
      ...(preferences.city.trim() ? { city: preferences.city.trim() } : {}),
      ...(preferences.time ? { time: preferences.time } : {}),
      ...(preferences.max_budget !== '' ? { max_budget: Number(preferences.max_budget) } : {}),
      ...(preferences.min_rating !== '' ? { min_rating: Number(preferences.min_rating) } : {}),
      ...(preferences.service_category ? { service_category: preferences.service_category } : {}),
    };

    try {
      const response = await api.smartButcherMatches(payload);
      if (!Array.isArray(response?.data)) {
        throw new Error('The matching service returned an unexpected response. Please try again.');
      }
      setMatches(response.data);
      navigate(location.pathname, {
        replace: true,
        state: {
          ...location.state,
          smartMatch: { preferences, matches: response.data },
        },
      });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const adjustPreferences = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    animalRef.current?.focus();
  };

  return (
    <div className="find-butcher-page smart-match-page">
      <CustomerNavigation />
      <main className="finder-main">
        <header className="finder-intro">
          <p className="finder-eyebrow">QurbaniX · Customer services</p>
          <h1>Find Your Best Match</h1>
          <p>Tell us what you need and we&apos;ll find verified butchers that match your requirements.</p>
        </header>

        <form id="smart-match-form" ref={formRef} className="smart-match-form" onSubmit={submitPreferences}>
          <div className="smart-match-form-heading">
            <div>
              <p className="finder-eyebrow">Your requirements</p>
              <h2>What are you looking for?</h2>
            </div>
            <p>Animal and preferred date are required. Other preferences are optional.</p>
          </div>
          <div className="smart-match-fields">
            <label className="finder-field">
              <span>Animal <span aria-hidden="true">*</span></span>
              <select ref={animalRef} name="animal_type" value={preferences.animal_type} onChange={updatePreference} required>
                {animalOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="finder-field">
              <span>Area <small>(optional)</small></span>
              <input name="area" type="text" maxLength="120" value={preferences.area} onChange={updatePreference} placeholder="e.g. Dhanmondi" />
            </label>
            <label className="finder-field">
              <span>City <small>(optional)</small></span>
              <input name="city" type="text" maxLength="120" value={preferences.city} onChange={updatePreference} placeholder="e.g. Dhaka" />
            </label>
            <label className="finder-field">
              <span>Preferred date <span aria-hidden="true">*</span></span>
              <input name="date" type="date" value={preferences.date} min={localDateString()} onChange={updatePreference} required />
            </label>
            <label className="finder-field">
              <span>Preferred time <small>(optional)</small></span>
              <input name="time" type="time" value={preferences.time} onChange={updatePreference} />
            </label>
            <label className="finder-field">
              <span>Maximum budget (৳) <small>(optional)</small></span>
              <input name="max_budget" type="number" min="0" step="1" inputMode="numeric" value={preferences.max_budget} onChange={updatePreference} placeholder="Any budget" />
            </label>
            <label className="finder-field">
              <span>Minimum rating <small>(optional)</small></span>
              <select name="min_rating" value={preferences.min_rating} onChange={updatePreference}>
                <option value="">Any rating</option>
                {[1, 2, 3, 4, 5].map((rating) => <option key={rating} value={rating}>{rating}+ stars</option>)}
              </select>
            </label>
            <label className="finder-field">
              <span>Service category <small>(optional)</small></span>
              <input name="service_category" type="text" maxLength="120" value={preferences.service_category} onChange={updatePreference} placeholder="Enter a service category" />
            </label>
          </div>

          {error ? <p className="smart-match-error" role="alert">{error}</p> : null}
          <div className="smart-match-form-actions">
            <button className="finder-search-button smart-match-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Finding matches…' : 'Find My Matches'}
            </button>
          </div>
        </form>

        {isSubmitting ? (
          <section className="finder-empty-state smart-match-state" role="status" aria-live="polite">
            <h2>Finding your matches</h2>
            <p>Checking verified services and availability for your selected date.</p>
          </section>
        ) : null}

        {!isSubmitting && matches === null && !error ? (
          <section className="finder-empty-state smart-match-state">
            <h2>{hasSubmitted ? 'Ready to update your matches' : 'Ready when you are'}</h2>
            <p>{hasSubmitted ? 'Your preferences have changed. Search again to see results for your updated requirements.' : 'Share your preferences above to see verified butchers ranked for your request.'}</p>
          </section>
        ) : null}

        {!isSubmitting && matches?.length === 0 ? (
          <section className="finder-empty-state smart-match-state" aria-live="polite">
            <span className="finder-empty-mark" aria-hidden="true">0</span>
            <h2>No matching butchers found</h2>
            <p>Try broadening your requirements, such as your area, budget, or service category.</p>
            <button type="button" className="finder-search-button" onClick={adjustPreferences}>Adjust Preferences</button>
          </section>
        ) : null}

        {!isSubmitting && matches?.length > 0 ? (
          <section className="smart-match-results" aria-labelledby="smart-match-results-heading">
            <div className="finder-results-heading">
              <div>
                <p className="finder-eyebrow">Ranked for your preferences</p>
                <h2 id="smart-match-results-heading">{matches.length} {matches.length === 1 ? 'match' : 'matches'} found</h2>
              </div>
              <div className="smart-match-result-actions">
                <span className="smart-match-score-note">Scores reflect your submitted criteria</span>
                <button type="button" className="finder-clear" onClick={adjustPreferences}>Adjust preferences</button>
              </div>
            </div>
            <div className="butcher-results-grid">
              {matches.map((match) => <MatchCard key={match.butcher.id} match={match} />)}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}

export default SmartMatch;
