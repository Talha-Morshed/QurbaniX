import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getCustomerNotifications, saveCustomerNotifications } from '../../components/customer/customerAccount';
import { CustomerNavigation } from './FindButchers';
import './CustomerNotifications.css';

const filters = [
  ['all', 'All'],
  ['unread', 'Unread'],
  ['booking', 'Bookings'],
  ['payment', 'Payments'],
  ['service', 'Services'],
  ['review', 'Reviews'],
  ['account', 'Account'],
];

function formatDateTime(date) {
  return new Date(date).toLocaleString('en-BD', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function notificationTarget(notification) {
  const bookingId = encodeURIComponent(notification.bookingId || '');
  if (notification.action === 'review' && notification.bookingId) return `/customer/reviews/${bookingId}`;
  if (notification.action === 'booking' && notification.bookingId) return `/customer/bookings/${bookingId}`;
  if (notification.action === 'profile') return '/customer/profile';
  return null;
}

function NotificationIcon({ type }) {
  return (
    <span className={`customer-notification-icon icon-${type}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="square" strokeLinejoin="miter">
        {type === 'booking' ? <><rect x="4" y="5" width="16" height="15" /><path d="M8 3v4m8-4v4M4 10h16m-12 4h3m-3 3h7" /></> : null}
        {type === 'payment' ? <><circle cx="12" cy="12" r="9" /><path d="M15 8.5c-.6-.6-1.4-.9-2.5-.9-1.4 0-2.4.7-2.4 1.8 0 2.8 4.8 1.1 4.8 4 0 1.1-1 2-2.5 2-1 0-2-.4-2.7-1.1M12 6v12" /></> : null}
        {type === 'service' ? <><path d="M5 12.5 9.5 17 19 7.5" /><path d="M20 12a8 8 0 1 1-4-6.9" /></> : null}
        {type === 'review' ? <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" /> : null}
        {type === 'account' ? <><circle cx="12" cy="8" r="3.5" /><path d="M4.5 20c.7-3.5 3.3-5.5 7.5-5.5s6.8 2 7.5 5.5" /></> : null}
      </svg>
    </span>
  );
}

function CustomerNotifications() {
  const [notifications, setNotifications] = useState(getCustomerNotifications);
  const [activeFilter, setActiveFilter] = useState('all');
  const [notice, setNotice] = useState('');
  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const visibleNotifications = notifications
    .filter((notification) => activeFilter === 'all'
      || (activeFilter === 'unread' ? !notification.read : notification.type === activeFilter))
    .sort((first, second) => second.date.localeCompare(first.date));

  const updateNotifications = (nextNotifications) => {
    setNotifications(saveCustomerNotifications(nextNotifications));
  };

  const markRead = (id) => {
    const selected = notifications.find((notification) => notification.id === id);
    if (!selected || selected.read) return;
    updateNotifications(notifications.map((notification) => notification.id === id ? { ...notification, read: true } : notification));
  };

  const markAllRead = () => {
    if (!unreadCount) return;
    updateNotifications(notifications.map((notification) => ({ ...notification, read: true })));
    setNotice('All notifications marked as read.');
  };

  const deleteNotification = (id) => {
    updateNotifications(notifications.filter((notification) => notification.id !== id));
    setNotice('Notification removed.');
  };

  return (
    <div className="find-butcher-page customer-notifications-page">
      <CustomerNavigation />
      <main className="customer-notifications-main">
        <header className="customer-notifications-heading">
          <div><p className="finder-eyebrow">Customer account</p><h1>Notifications</h1><p>{unreadCount ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}` : 'You are all caught up.'}</p></div>
          <button className="booking-secondary-button" type="button" disabled={!unreadCount} onClick={markAllRead}>Mark all as read</button>
        </header>
        {notice ? <p className="customer-notifications-notice" role="status">{notice}</p> : null}
        <div className="customer-notification-filters" role="tablist" aria-label="Filter notifications">
          {filters.map(([filter, label]) => (
            <button type="button" role="tab" aria-selected={activeFilter === filter} className={activeFilter === filter ? 'is-active' : ''} key={filter} onClick={() => setActiveFilter(filter)}>{label}</button>
          ))}
        </div>
        {visibleNotifications.length ? (
          <section className="customer-notification-list" aria-label={`${filters.find(([filter]) => filter === activeFilter)?.[1]} notifications`}>
            {visibleNotifications.map((notification) => {
              const target = notificationTarget(notification);
              const content = (
                <>
                  <NotificationIcon type={notification.type} />
                  <span className="customer-notification-copy"><strong>{notification.title}</strong><span>{notification.message}</span><time dateTime={notification.date}>{formatDateTime(notification.date)}</time></span>
                  {target ? <span className="customer-notification-action">{notification.action === 'review' ? 'Leave a Review' : notification.action === 'profile' ? 'View Profile' : 'View Booking'} <span aria-hidden="true">→</span></span> : null}
                </>
              );
              return (
                <article className={`customer-notification-item ${notification.read ? '' : 'is-unread'}`} key={notification.id}>
                  {target ? <Link className="customer-notification-content" to={target} onClick={() => markRead(notification.id)}>{content}</Link> : <button className="customer-notification-content" type="button" onClick={() => markRead(notification.id)}>{content}</button>}
                  <div className="customer-notification-tools">
                    {!notification.read ? <span className="customer-unread-label"><span />Unread</span> : null}
                    <button className="customer-notification-delete" type="button" aria-label={`Delete ${notification.title} notification`} onClick={() => deleteNotification(notification.id)}>Delete</button>
                  </div>
                </article>
              );
            })}
          </section>
        ) : (
          <section className="customer-notifications-empty"><span aria-hidden="true">✓</span><h2>No notifications</h2><p>You&apos;re all caught up.</p></section>
        )}
      </main>
    </div>
  );
}

export default CustomerNotifications;
