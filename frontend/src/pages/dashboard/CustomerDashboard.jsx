import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCustomerAccount, getCustomerNotifications } from '../../components/customer/customerAccount';
import { getCustomerBookings, getCustomerReviews } from '../../components/customer/customerBookings';
import { butchers } from '../../components/customer/butchersData';
import { getButcherServices } from '../../components/customer/butcherProfileData';
import { CustomerNavigation, VerifiedMark } from '../customer/FindButchers';
import './CustomerDashboard.css';

const money = (amount) => `৳${Number(amount || 0).toLocaleString('en-BD')}`;

const plannerAnimals = {
  Goat: { sharesPerAnimal: 1, basePrice: 3200, descriptor: 'best for small and medium family plans' },
  Sheep: { sharesPerAnimal: 1, basePrice: 3000, descriptor: 'balanced budget option for shared or family use' },
  Cow: { sharesPerAnimal: 7, basePrice: 52000, descriptor: 'fits larger family or shared sacrifice plans' },
  'Shared Cow': { sharesPerAnimal: 1, basePrice: 7500, descriptor: 'ideal for cost-sharing with family or friends' },
  Camel: { sharesPerAnimal: 7, basePrice: 70000, descriptor: 'premium choice for large gatherings and celebrations' },
};

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
  const account = getCustomerAccount();
  const bookings = getCustomerBookings();
  const reviews = getCustomerReviews();
  const notifications = [...getCustomerNotifications()].sort((first, second) => second.date.localeCompare(first.date));
  const [plannerHouseholdSize, setPlannerHouseholdSize] = useState(4);
  const [plannerAnimal, setPlannerAnimal] = useState('Goat');
  const [plannerBudget, setPlannerBudget] = useState(15000);
  const [plannerLocation, setPlannerLocation] = useState('Dhanmondi, Dhaka');

  const plannerInsight = useMemo(() => {
    const householdSize = Math.max(1, Number(plannerHouseholdSize) || 1);
    const animalProfile = plannerAnimals[plannerAnimal] || plannerAnimals.Goat;
    const sharesNeeded = Math.max(1, Math.ceil(householdSize / 2));
    const unitsNeeded = Math.max(1, Math.ceil(sharesNeeded / animalProfile.sharesPerAnimal));
    const estimatedMinimum = unitsNeeded * animalProfile.basePrice;
    const estimatedMaximum = estimatedMinimum + (animalProfile.basePrice * 0.22);
    const budgetValue = Number(plannerBudget) || 0;
    const budgetGap = estimatedMaximum - budgetValue;
    const matchedButchers = butchers.filter((butcher) => {
      const matchesAnimal = butcher.animals.includes(plannerAnimal) || (plannerAnimal === 'Shared Cow' && butcher.animals.includes('Shared Cow'));
      return butcher.verified && matchesAnimal && (!plannerLocation || butcher.area === plannerLocation);
    }).slice(0, 2);

    return {
      householdSize,
      sharesNeeded,
      unitsNeeded,
      estimatedMinimum,
      estimatedMaximum,
      budgetGap,
      matchedButchers,
      budgetStatus: budgetValue >= estimatedMaximum ? 'within-budget' : 'needs-more',
    };
  }, [plannerAnimal, plannerBudget, plannerHouseholdSize, plannerLocation]);

  const today = new Date().toISOString().slice(0, 10);
  const eligibleUpcomingBookings = bookings
    .filter((booking) => ['Pending', 'Confirmed', 'In Progress'].includes(booking.status) && booking.date >= today)
    .sort((first, second) => first.date.localeCompare(second.date));
  const upcomingBooking = eligibleUpcomingBookings[0];
  const recentBookings = [...bookings].sort((first, second) => second.createdDate.localeCompare(first.createdDate)).slice(0, 4);
  const nextReviewBooking = bookings.find((booking) => booking.status === 'Completed' && !booking.review);
  const writeReviewPath = nextReviewBooking ? `/customer/reviews/${encodeURIComponent(nextReviewBooking.id)}` : '/customer/reviews';
  const latestReview = [...reviews].sort((first, second) => second.date.localeCompare(first.date))[0];
  const verifiedButchers = butchers.filter((butcher) => butcher.verified).slice(0, 3);
  const pendingBookings = bookings.filter((booking) => booking.status === 'Pending').length;
  const completedBookings = bookings.filter((booking) => booking.status === 'Completed').length;

  return (
    <div className="find-butcher-page customer-dashboard-page">
      <CustomerNavigation />
      <main className="customer-dashboard-main">
        <header className="customer-dashboard-welcome">
          <div><p className="finder-eyebrow">Customer dashboard</p><h1>Welcome back, {account.profile.name}</h1><p>Manage your Qurbani services, bookings, and payments from one place.</p></div>
          <Link className="booking-primary-button" to="/dashboard/customer/find-butcher">Find a Verified Butcher <span aria-hidden="true">→</span></Link>
        </header>

        <section className="customer-dashboard-stats" aria-label="Booking summary">
          <Link to="/customer/bookings"><strong>{bookings.length}</strong><span>Total bookings</span><small>All your service requests</small></Link>
          <Link to="/customer/bookings"><strong>{pendingBookings}</strong><span>Pending bookings</span><small>Awaiting butcher confirmation</small></Link>
          <Link to="/customer/bookings"><strong>{completedBookings}</strong><span>Completed bookings</span><small>Finished services</small></Link>
          <Link to="/customer/reviews"><strong>{reviews.length}</strong><span>Reviews written</span><small>Your shared experiences</small></Link>
        </section>

        <div className="customer-dashboard-content">
          <div className="customer-dashboard-primary">
            <section className="customer-dashboard-panel customer-upcoming-panel">
              <DashboardSectionHeading eyebrow="Next on your calendar" title="Upcoming Booking" />
              {upcomingBooking ? (
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
                {plannerInsight.matchedButchers.length ? (
                  plannerInsight.matchedButchers.map((butcher) => (
                    <div key={butcher.id} className="planner-match-item">
                      <div>
                        <strong>{butcher.name}</strong>
                        <small>{butcher.area}</small>
                      </div>
                      <div>
                        <span>★ {butcher.rating.toFixed(1)}</span>
                        <strong>{money(butcher.startingPrice)}</strong>
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
              {recentBookings.length ? (
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
              {notifications.length ? (
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
              {latestReview ? (
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
            {verifiedButchers.map((butcher) => {
              const mainService = butcher.services[0] || getButcherServices(butcher)[0]?.name;
              return (
                <article className="customer-dashboard-butcher" key={butcher.id}>
                  <div className="customer-dashboard-butcher-person">{butcher.image ? <img src={butcher.image} alt={butcher.name} /> : <span>{butcher.initials}</span>}<div><h3>{butcher.name}</h3><VerifiedMark verified={butcher.verified} /><p>★ {butcher.rating.toFixed(1)} · {butcher.area}</p></div></div>
                  <div className="customer-dashboard-butcher-service"><span>{mainService}</span><strong>From {money(butcher.startingPrice)}</strong></div>
                  <Link to={`/dashboard/customer/find-butcher/${butcher.id}`}>View Profile <span aria-hidden="true">→</span></Link>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

export default CustomerDashboard;
