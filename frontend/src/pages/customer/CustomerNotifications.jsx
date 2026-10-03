import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
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

function mapApiNotification(record) {
  const type = ['booking', 'payment', 'service', 'review', 'account'].includes(record.type) ? record.type : 'account';
  return {
    id: String(record.id),
    type,
    title: record.title,
    message: record.message,
    date: record.created_at,
    read: Boolean(record.read_at),
    bookingId: record.booking_id ? String(record.booking_id) : '',
    action: type === 'review' ? 'review' : ['booking', 'payment'].includes(type) ? 'booking' : type === 'account' ? 'profile' : '',
  };
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
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [retryKey, setRetryKey] = useState(0);
  const updatingIds = useRef(new Set());
  const markingAll = useRef(false);

  useEffect(() => {
    let isCurrentRequest = true;
    setIsLoading(true);
    setError('');
    api.customerNotifications({ per_page: 100 })
      .then((response) => {
        if (isCurrentRequest) {
          setNotifications((response.data || []).map(mapApiNotification));
          window.dispatchEvent(new Event('customer-notifications-updated'));
        }
      })
      .catch((requestError) => {
        if (!isCurrentRequest) return;
        setNotifications([]);
        setError(requestError?.message || 'Unable to load your notifications.');
      })
      .finally(() => {
        if (isCurrentRequest) setIsLoading(false);
      });
    return () => {
      isCurrentRequest = false;
    };
  }, [retryKey]);

  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const visibleNotifications = notifications
    .filter((notification) => activeFilter === 'all'
      || (activeFilter === 'unread' ? !notification.read : notification.type === activeFilter))
    .sort((first, second) => second.date.localeCompare(first.date));

  const markRead = async (id) => {
    const selected = notifications.find((notification) => notification.id === id);
    if (!selected || selected.read || updatingIds.current.size || markingAll.current) return;
    updatingIds.current.add(id);
    setUpdatingId(id);
    setError('');
    try {
      const response = await api.markNotificationRead(id);
      const updated = mapApiNotification(response.notification);
      setNotifications((current) => current.map((notification) => notification.id === id ? updated : notification));
      window.dispatchEvent(new Event('customer-notifications-updated'));
    } catch (requestError) {
      setError(requestError?.message || 'Unable to mark this notification as read.');
    } finally {
      updatingIds.current.delete(id);
      setUpdatingId(null);
    }
  };

  const markAllRead = async () => {
    if (!unreadCount || updatingIds.current.size || markingAll.current) return;
    markingAll.current = true;
    setIsUpdating(true);
    setError('');
    try {
      await api.markAllNotificationsRead();
      setNotifications((current) => current.map((notification) => ({ ...notification, read: true })));
      setNotice('All notifications marked as read.');
      window.dispatchEvent(new Event('customer-notifications-updated'));
    } catch (requestError) {
      setError(requestError?.message || 'Unable to mark notifications as read.');
    } finally {
      markingAll.current = false;
      setIsUpdating(false);
    }
  };

  return (
    <div className="find-butcher-page customer-notifications-page">
      <CustomerNavigation />
      <main className="customer-notifications-main">
        <header className="customer-notifications-heading">
          <div><p className="finder-eyebrow">Customer account</p><h1>Notifications</h1><p>{unreadCount ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}` : 'You are all caught up.'}</p></div>
          <button className="booking-secondary-button" type="button" disabled={!unreadCount || isUpdating} onClick={markAllRead}>Mark all as read</button>
        </header>
        {notice ? <p className="customer-notifications-notice" role="status">{notice}</p> : null}
        {error ? <div className="customer-notifications-notice" role="alert"><p>{error}</p><button className="booking-secondary-button" type="button" onClick={() => setRetryKey((current) => current + 1)}>Try again</button></div> : null}
        <div className="customer-notification-filters" role="tablist" aria-label="Filter notifications">
          {filters.map(([filter, label]) => (
            <button type="button" role="tab" aria-selected={activeFilter === filter} className={activeFilter === filter ? 'is-active' : ''} key={filter} onClick={() => setActiveFilter(filter)}>{label}</button>
          ))}
        </div>
        {isLoading ? <p role="status">Loading notifications...</p> : null}
        {!isLoading && !error && visibleNotifications.length ? (
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
                  {target ? <Link className="customer-notification-content" to={target} onClick={(event) => { if (updatingIds.current.has(notification.id)) event.preventDefault(); else void markRead(notification.id); }}>{content}</Link> : <button className="customer-notification-content" type="button" disabled={updatingId === notification.id} onClick={() => markRead(notification.id)}>{content}</button>}
                  <div className="customer-notification-tools">
                    {!notification.read ? <span className="customer-unread-label"><span />Unread</span> : null}
                    {updatingId === notification.id ? <span role="status">Updating...</span> : null}
                  </div>
                </article>
              );
            })}
          </section>
        ) : null}
        {!isLoading && !error && !visibleNotifications.length ? (
          <section className="customer-notifications-empty"><span aria-hidden="true">✓</span><h2>No notifications</h2><p>You&apos;re all caught up.</p></section>
        ) : null}
      </main>
    </div>
  );
}

export default CustomerNotifications;
