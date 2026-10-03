import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import { useAuth } from '../../auth/AuthContext';
import { mapApiBooking, mapApiReview } from '../../utils/apiBookings';
import { mapDirectoryButcher } from '../../utils/butcherDirectory';
import { CustomerNavigation, VerifiedMark } from '../customer/FindButchers';
import './CustomerDashboard.css';

const money = (amount) => `৳${Number(amount || 0).toLocaleString('en-BD')}`;

const plannerAnimals = {
  Goat: { sharesPerAnimal: 1, basePrice: 3200 },
  Sheep: { sharesPerAnimal: 1, basePrice: 3000 },
  Cow: { sharesPerAnimal: 7, basePrice: 52000 },
  'Shared Cow': { sharesPerAnimal: 1, basePrice: 7500 },
  Camel: { sharesPerAnimal: 7, basePrice: 70000 },
};

async function loadAllPages(fetchPage) {
  const items = [];
  let page = 1;
  let lastPage = 1;
  do {
    const response = await fetchPage(page);
    items.push(...(response.data || []));
    lastPage = response.last_page || 1;
    page += 1;
  } while (page <= lastPage);
  return items;
}

function mapApiNotification(record) {
  const type = ['booking', 'payment', 'service', 'review', 'account'].includes(record.type) ? record.type : 'account';
  return {
    id: String(record.id),
    type,
    title: record.title,
    message: record.message,
    date: record.created_at,
    read: Boolean(record.read_at),
  };
}

function DashboardLoadState({ message, error, onRetry }) {
  return (
    <div className="customer-dashboard-empty" role={error ? 'alert' : 'status'}>
      <p>{error || message}</p>
      {error && onRetry ? <button className="booking-secondary-button" type="button" onClick={onRetry}>Try again</button> : null}
    </div>
  );
}

function formatDate(date) {
  if (!date) return 'Date not set';
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(time) {
  if (!time) return 'Time not set';
  const [hour, minute] = time.split(':').map(Number);
  return new Date(2000, 0, 1, hour, minute).toLocaleTimeString('en-BD', { hour: 'numeric', minute: '2-digit' });
}

function statusClass(status) {
  return `customer-dashboard-status status-${status.toLowerCase().replaceAll(' ', '-')}`;
}

function DashboardSectionHeading({ eyebrow, title, to, action }) {
  return (
    <div className="customer-dashboard-section-heading">
      <div><p className="finder-eyebrow">{eyebrow}</p><h2>{title}</h2></div>
      {to ? <Link to={to}>{action} <span aria-hidden="true">→</span></Link> : null}
    </div>
  );
}

function NotificationTypeIcon({ type }) {
  const symbols = { booking: 'B', payment: '$', service: 'S', review: '★', account: 'A' };
  return <span className={`customer-dashboard-notification-icon type-${type}`} aria-hidden="true">{symbols[type] || '•'}</span>;
}

function CustomerDashboard() {
  const { user: authenticatedUser } = useAuth();
  const [account, setAccount] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [verifiedButchers, setVerifiedButchers] = useState([]);
  const [plannerMatches, setPlannerMatches] = useState([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [butchersLoading, setButchersLoading] = useState(true);
  const [plannerMatchesLoading, setPlannerMatchesLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [bookingsError, setBookingsError] = useState('');
  const [reviewsError, setReviewsError] = useState('');
  const [notificationsError, setNotificationsError] = useState('');
  const [butchersError, setButchersError] = useState('');
  const [plannerMatchesError, setPlannerMatchesError] = useState('');
  const [profileRetry, setProfileRetry] = useState(0);
  const [bookingsRetry, setBookingsRetry] = useState(0);
  const [reviewsRetry, setReviewsRetry] = useState(0);
  const [notificationsRetry, setNotificationsRetry] = useState(0);
  const [butchersRetry, setButchersRetry] = useState(0);
  const [plannerHouseholdSize, setPlannerHouseholdSize] = useState(4);
  const [plannerAnimal, setPlannerAnimal] = useState('Goat');
  const [plannerBudget, setPlannerBudget] = useState(15000);
  const [plannerLocation, setPlannerLocation] = useState('Dhanmondi, Dhaka');

  useEffect(() => {
    let isCurrentRequest = true;
    setProfileLoading(true);
    setProfileError('');
    api.customerProfile()
      .then((response) => {
        if (isCurrentRequest) setAccount(response.user);
      })
      .catch((error) => {
        if (!isCurrentRequest) return;
        setAccount(null);
        setProfileError(error?.message || 'Unable to load your profile.');
      })
      .finally(() => {
        if (isCurrentRequest) setProfileLoading(false);
      });
    return () => {
      isCurrentRequest = false;
    };
  }, [profileRetry]);

  useEffect(() => {
    let isCurrentRequest = true;
    setBookingsLoading(true);
    setBookingsError('');
    loadAllPages((page) => api.customerBookings({ per_page: 100, page }))
      .then((records) => {
        if (isCurrentRequest) setBookings(records.map(mapApiBooking));
      })
      .catch((error) => {
        if (!isCurrentRequest) return;
        setBookings([]);
        setBookingsError(error?.message || 'Unable to load your bookings.');
      })
      .finally(() => {
        if (isCurrentRequest) setBookingsLoading(false);
      });
    return () => {
      isCurrentRequest = false;
    };
  }, [bookingsRetry]);

  useEffect(() => {
    let isCurrentRequest = true;
    setReviewsLoading(true);
    setReviewsError('');
    loadAllPages((page) => api.customerReviews({ per_page: 100, page }))
      .then((records) => {
        if (isCurrentRequest) setReviews(records.map((review) => mapApiReview(review)));
      })
      .catch((error) => {
        if (!isCurrentRequest) return;
        setReviews([]);
        setReviewsError(error?.message || 'Unable to load your reviews.');
      })
      .finally(() => {
        if (isCurrentRequest) setReviewsLoading(false);
      });
    return () => {
      isCurrentRequest = false;
    };
  }, [reviewsRetry]);

  useEffect(() => {
    let isCurrentRequest = true;
    setNotificationsLoading(true);
    setNotificationsError('');
    loadAllPages((page) => api.customerNotifications({ per_page: 100, page }))
      .then((records) => {
        if (isCurrentRequest) {
          setNotifications(records.map(mapApiNotification).sort((first, second) => second.date.localeCompare(first.date)));
        }
      })
      .catch((error) => {
        if (!isCurrentRequest) return;
        setNotifications([]);
        setNotificationsError(error?.message || 'Unable to load your notifications.');
      })
      .finally(() => {
        if (isCurrentRequest) setNotificationsLoading(false);
      });
    return () => {
      isCurrentRequest = false;
    };
  }, [notificationsRetry]);

  useEffect(() => {
    let isCurrentRequest = true;
    setButchersLoading(true);
    setButchersError('');
    api.butchers({ per_page: 3, sort: 'rating' })
      .then((response) => {
        if (isCurrentRequest) setVerifiedButchers((response.data || []).map(mapDirectoryButcher));
      })
      .catch((error) => {
        if (!isCurrentRequest) return;
        setVerifiedButchers([]);
        setButchersError(error?.message || 'Unable to load verified butchers.');
      })
      .finally(() => {
        if (isCurrentRequest) setButchersLoading(false);
      });
    return () => {
      isCurrentRequest = false;
    };
  }, [butchersRetry]);

  useEffect(() => {
    let isCurrentRequest = true;
    setPlannerMatchesLoading(true);
    setPlannerMatchesError('');
    const locationParts = plannerLocation.split(',').map((part) => part.trim()).filter(Boolean);
    const filters = {
      animal: plannerAnimal,
      available: true,
      per_page: 2,
      sort: 'rating',
      ...(locationParts.length > 1
        ? { area: locationParts[0], city: locationParts[1] }
        : { city: locationParts[0] || '' }),
    };
    api.butchers(filters)
      .then((response) => {
        if (isCurrentRequest) setPlannerMatches((response.data || []).map(mapDirectoryButcher));
      })
      .catch((error) => {
        if (!isCurrentRequest) return;
        setPlannerMatches([]);
        setPlannerMatchesError(error?.message || 'Unable to load matching butchers.');
      })
      .finally(() => {
        if (isCurrentRequest) setPlannerMatchesLoading(false);
      });
    return () => {
      isCurrentRequest = false;
    };
  }, [plannerAnimal, plannerLocation]);

  const plannerInsight = useMemo(() => {
    const householdSize = Math.max(1, Number(plannerHouseholdSize) || 1);
    const animalProfile = plannerAnimals[plannerAnimal] || plannerAnimals.Goat;
    const sharesNeeded = Math.max(1, Math.ceil(householdSize / 2));
    const unitsNeeded = Math.max(1, Math.ceil(sharesNeeded / animalProfile.sharesPerAnimal));
    const estimatedMinimum = unitsNeeded * animalProfile.basePrice;
    const estimatedMaximum = estimatedMinimum + (animalProfile.basePrice * 0.22);
    const budgetValue = Number(plannerBudget) || 0;
    const budgetGap = estimatedMaximum - budgetValue;
    return {
      householdSize,
      sharesNeeded,
      unitsNeeded,
      estimatedMinimum,
      estimatedMaximum,
      budgetGap,
      budgetStatus: budgetValue >= estimatedMaximum ? 'within-budget' : 'needs-more',
    };
  }, [plannerAnimal, plannerBudget, plannerHouseholdSize]);

  const today = new Date().toISOString().slice(0, 10);
  const eligibleUpcomingBookings = bookings
    .filter((booking) => ['Pending', 'Confirmed', 'In Progress'].includes(booking.status) && booking.date >= today)
    .sort((first, second) => first.date.localeCompare(second.date));
  const upcomingBooking = eligibleUpcomingBookings[0];
  const recentBookings = [...bookings].sort((first, second) => second.createdDate.localeCompare(first.createdDate)).slice(0, 4);
  const nextReviewBooking = bookings.find((booking) => booking.status === 'Completed' && !booking.review);
  const writeReviewPath = nextReviewBooking ? `/customer/reviews/${encodeURIComponent(nextReviewBooking.id)}` : '/customer/reviews';
  const latestReview = [...reviews].sort((first, second) => second.date.localeCompare(first.date))[0];
  const pendingBookings = bookings.filter((booking) => booking.status === 'Pending').length;
  const completedBookings = bookings.filter((booking) => booking.status === 'Completed').length;

  return (
    <div className="find-butcher-page customer-dashboard-page">
      <CustomerNavigation />
      <main className="customer-dashboard-main">
        <header className="customer-dashboard-welcome">
          <div>
            <p className="finder-eyebrow">Customer dashboard</p>
            <h1>Welcome back, {account?.name || authenticatedUser?.name || 'Customer'}</h1>
            <p>Manage your Qurbani services, bookings, and payments from one place.</p>
            {profileLoading ? <small role="status">Loading profile...</small> : null}
            {profileError ? <p className="customer-dashboard-error" role="alert">{profileError} <button type="button" onClick={() => setProfileRetry((current) => current + 1)}>Try again</button></p> : null}
          </div>
          <Link className="booking-primary-button" to="/dashboard/customer/find-butcher">Find a Verified Butcher <span aria-hidden="true">→</span></Link>
        </header>

        <section className="customer-dashboard-stats" aria-label="Booking summary">
          <Link to="/customer/bookings"><strong>{bookingsLoading ? '…' : bookingsError ? '—' : bookings.length}</strong><span>Total bookings</span><small>All your service requests</small></Link>
          <Link to="/customer/bookings"><strong>{bookingsLoading ? '…' : bookingsError ? '—' : pendingBookings}</strong><span>Pending bookings</span><small>Awaiting butcher confirmation</small></Link>
          <Link to="/customer/bookings"><strong>{bookingsLoading ? '…' : bookingsError ? '—' : completedBookings}</strong><span>Completed bookings</span><small>Finished services</small></Link>
          <Link to="/customer/reviews"><strong>{reviewsLoading ? '…' : reviewsError ? '—' : reviews.length}</strong><span>Reviews written</span><small>Your shared experiences</small></Link>
        </section>

        <div className="customer-dashboard-content">
          <div className="customer-dashboard-primary">
            <section className="customer-dashboard-panel customer-upcoming-panel">
              <DashboardSectionHeading eyebrow="Next on your calendar" title="Upcoming Booking" />
              {bookingsLoading ? <DashboardLoadState message="Loading your bookings..." /> : bookingsError ? <DashboardLoadState error={bookingsError} onRetry={() => setBookingsRetry((current) => current + 1)} /> : upcomingBooking ? (
                <div className="customer-upcoming-details">
                  <div className="customer-upcoming-title"><div><h3>{upcomingBooking.butcherName}</h3><VerifiedMark verified={upcomingBooking.butcherVerified} /></div><span className={statusClass(upcomingBooking.status)}>{upcomingBooking.status}</span></div>
                  <dl><div><dt>Service</dt><dd>{upcomingBooking.serviceName} · {upcomingBooking.animal}</dd></div><div><dt>Date &amp; time</dt><dd>{formatDate(upcomingBooking.date)} · {formatTime(upcomingBooking.time)}</dd></div><div><dt>Location</dt><dd>{upcomingBooking.area}, {upcomingBooking.city}</dd></div><div><dt>Remaining</dt><dd>{money(upcomingBooking.remaining)}</dd></div></dl>
                  <Link className="booking-secondary-button" to={`/customer/bookings/${encodeURIComponent(upcomingBooking.id)}`}>View Booking</Link>
                </div>
              ) : (
                <div className="customer-dashboard-empty"><p>No upcoming bookings</p><Link className="booking-primary-button" to="/dashboard/customer/find-butcher">Find a Verified Butcher</Link></div>
              )}
            </section>

            <section className="customer-dashboard-panel customer-planner-panel">
              <DashboardSectionHeading eyebrow="Planning tool" title="Smart Qurbani Planner" />
              <div className="customer-planner-layout">
                <div className="customer-planner-form">
                  <label className="customer-planner-field">
                    <span>Household size</span>
                    <input type="number" min="1" max="25" value={plannerHouseholdSize} onChange={(event) => setPlannerHouseholdSize(event.target.value)} />
                  </label>
                  <label className="customer-planner-field">
                    <span>Animal type</span>
                    <select value={plannerAnimal} onChange={(event) => setPlannerAnimal(event.target.value)}>
                      {Object.keys(plannerAnimals).map((animal) => (
                        <option key={animal} value={animal}>{animal}</option>
                      ))}
                    </select>
                  </label>
                  <label className="customer-planner-field">
                    <span>Budget target</span>
                    <input type="number" min="2000" step="500" value={plannerBudget} onChange={(event) => setPlannerBudget(event.target.value)} />
                  </label>
                  <label className="customer-planner-field">
                    <span>Preferred area</span>
                    <select value={plannerLocation} onChange={(event) => setPlannerLocation(event.target.value)}>
                      <option value="Dhanmondi, Dhaka">Dhanmondi, Dhaka</option>
                      <option value="Gulshan, Dhaka">Gulshan, Dhaka</option>
                      <option value="Mirpur, Dhaka">Mirpur, Dhaka</option>
                      <option value="Uttara, Dhaka">Uttara, Dhaka</option>
                      <option value="Mohammadpur, Dhaka">Mohammadpur, Dhaka</option>
                      <option value="Banani, Dhaka">Banani, Dhaka</option>
                      <option value="Chattogram">Chattogram</option>
                    </select>
                  </label>
                </div>

                <div className="customer-planner-summary">
                  <span className="planner-tag">Recommended</span>
                  <h3>{plannerAnimal === 'Shared Cow' ? '1 shared cow bundle' : `${plannerInsight.unitsNeeded} ${plannerAnimal.toLowerCase()} ${plannerAnimal === 'Goat' || plannerAnimal === 'Sheep' ? 'animals' : 'unit(s)'}`}</h3>
                  <p>
                    For {plannerInsight.householdSize} family members, a {plannerAnimal.toLowerCase()} setup is estimated to cover about {plannerInsight.sharesNeeded} share(s).
                  </p>
                  <div className="planner-total-row">
                    <span>Estimated spend</span>
                    <strong>{money(plannerInsight.estimatedMaximum)}</strong>
                  </div>
                  <div className={`planner-budget-note ${plannerInsight.budgetStatus}`}>
                    {plannerInsight.budgetStatus === 'within-budget'
                      ? `You are within budget by ${money(Math.max(plannerInsight.budgetGap * -1, 0))}.`
                      : `You need about ${money(Math.max(plannerInsight.budgetGap, 0))} more to stay comfortable.`}
                  </div>
                </div>
              </div>

              <div className="customer-planner-matches">
                <div className="planner-matches-header">
                  <strong>Best local matches</strong>
                  <span>{plannerLocation}</span>
                </div>
                {plannerMatchesLoading ? <p role="status">Loading matching verified butchers...</p> : plannerMatchesError ? (
                  <div className="planner-empty-state" role="alert">{plannerMatchesError}</div>
                ) : plannerMatches.length ? (
                  plannerMatches.map((butcher) => (
                    <div key={butcher.id} className="planner-match-item">
                      <div>
                        <strong>{butcher.name}</strong>
                        <small>{butcher.area}</small>
                      </div>
                      <div>
                        <span>★ {butcher.rating.toFixed(1)}</span>
                        <strong>{butcher.startingPrice == null ? 'Price not listed' : money(butcher.startingPrice)}</strong>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="planner-empty-state">No matched butchers available for this combination yet.</div>
                )}
              </div>
            </section>

            <section className="customer-dashboard-panel">
              <DashboardSectionHeading eyebrow="Your activity" title="Recent Bookings" to="/customer/bookings" action="View All Bookings" />
              {bookingsLoading ? <DashboardLoadState message="Loading your bookings..." /> : bookingsError ? <DashboardLoadState error={bookingsError} onRetry={() => setBookingsRetry((current) => current + 1)} /> : recentBookings.length ? (
                <div className="customer-recent-bookings">
                  {recentBookings.map((booking) => (
                    <article className="customer-recent-booking" key={booking.id}>
                      <div className="customer-recent-booking-copy"><strong>{booking.reference}</strong><span>{booking.butcherName} · {booking.serviceName}</span><small>{formatDate(booking.date)}</small></div>
                      <div className="customer-recent-booking-meta"><strong>{money(booking.total)}</strong><span className={statusClass(booking.status)}>{booking.status}</span><Link to={`/customer/bookings/${encodeURIComponent(booking.id)}`}>View <span aria-hidden="true">→</span></Link></div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="customer-dashboard-empty"><p>No bookings yet.</p><Link to="/dashboard/customer/find-butcher">Find a Verified Butcher</Link></div>
              )}
            </section>
          </div>

          <aside className="customer-dashboard-secondary">
            <section className="customer-dashboard-panel">
              <DashboardSectionHeading eyebrow="Latest updates" title="Notifications" to="/customer/notifications" action="View All Notifications" />
              {notificationsLoading ? <DashboardLoadState message="Loading your notifications..." /> : notificationsError ? <DashboardLoadState error={notificationsError} onRetry={() => setNotificationsRetry((current) => current + 1)} /> : notifications.length ? (
                <div className="customer-dashboard-notifications">
                  {notifications.slice(0, 4).map((notification) => (
                    <Link className={`customer-dashboard-notification ${notification.read ? '' : 'is-unread'}`} key={notification.id} to="/customer/notifications">
                      <NotificationTypeIcon type={notification.type} />
                      <span><strong>{notification.title}</strong><small>{notification.message}</small><time>{new Date(notification.date).toLocaleString('en-BD', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}</time></span>
                      {!notification.read ? <i aria-label="Unread" /> : null}
                    </Link>
                  ))}
                </div>
              ) : <div className="customer-dashboard-empty"><p>You&apos;re all caught up.</p></div>}
            </section>

            <section className="customer-dashboard-panel">
              <DashboardSectionHeading eyebrow="Customer feedback" title="Your Reviews" to="/customer/reviews" action="View All Reviews" />
              {reviewsLoading ? <DashboardLoadState message="Loading your reviews..." /> : reviewsError ? <DashboardLoadState error={reviewsError} onRetry={() => setReviewsRetry((current) => current + 1)} /> : latestReview ? (
                <article className="customer-dashboard-review">
                  <div><strong>{latestReview.butcherName}</strong><span>{'★'.repeat(latestReview.rating)} · {latestReview.rating}.0 / 5</span></div>
                  <p>{latestReview.comment}</p>
                  <small>{latestReview.service} · {latestReview.date}</small>
                </article>
              ) : (
                <div className="customer-dashboard-empty"><p>You haven&apos;t written any reviews yet.</p>{nextReviewBooking ? <Link to={writeReviewPath}>Review a completed booking</Link> : <Link to="/customer/bookings">View completed bookings</Link>}</div>
              )}
            </section>

            <section className="customer-dashboard-panel customer-quick-actions-panel">
              <DashboardSectionHeading eyebrow="Shortcuts" title="Quick Actions" />
              <nav className="customer-dashboard-quick-actions" aria-label="Customer quick actions">
                <Link to="/dashboard/customer/find-butcher"><span aria-hidden="true">⌕</span>Find a Butcher</Link>
                <Link to="/customer/bookings"><span aria-hidden="true">▤</span>View Bookings</Link>
                <Link to={writeReviewPath}><span aria-hidden="true">★</span>Write a Review</Link>
                <Link to="/customer/notifications"><span aria-hidden="true">♧</span>Notifications</Link>
                <Link to="/customer/profile"><span aria-hidden="true">◉</span>My Profile</Link>
              </nav>
            </section>
          </aside>
        </div>

        <section className="customer-dashboard-panel customer-verified-section">
          <DashboardSectionHeading eyebrow="Local professionals" title="Verified Butchers" to="/dashboard/customer/find-butcher" action="Find More Butchers" />
          <div className="customer-dashboard-butcher-grid">
            {butchersLoading ? <DashboardLoadState message="Loading verified butchers..." /> : butchersError ? <DashboardLoadState error={butchersError} onRetry={() => setButchersRetry((current) => current + 1)} /> : verifiedButchers.length ? verifiedButchers.map((butcher) => {
              const mainService = butcher.services[0] || 'Service details unavailable';
              return (
                <article className="customer-dashboard-butcher" key={butcher.id}>
                  <div className="customer-dashboard-butcher-person">{butcher.image ? <img src={butcher.image} alt={butcher.name} /> : <span>{butcher.initials}</span>}<div><h3>{butcher.name}</h3><VerifiedMark verified={butcher.verified} /><p>★ {butcher.rating.toFixed(1)} · {butcher.area}</p></div></div>
                  <div className="customer-dashboard-butcher-service"><span>{mainService}</span><strong>{butcher.startingPrice == null ? 'Price not listed' : `From ${money(butcher.startingPrice)}`}</strong></div>
                  <Link to={`/dashboard/customer/find-butcher/${butcher.id}`}>View Profile <span aria-hidden="true">→</span></Link>
                </article>
              );
            }) : <DashboardLoadState message="No verified butchers are available yet." />}
          </div>
        </section>
      </main>
    </div>
  );
}

export default CustomerDashboard;
