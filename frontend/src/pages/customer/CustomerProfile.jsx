import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useAuth } from '../../auth/AuthContext';
import { CustomerNavigation } from './FindButchers';
import './CustomerProfile.css';

const notificationOptions = [
  ['bookingUpdates', 'Booking updates', 'Booking requests and schedule changes'],
  ['paymentUpdates', 'Payment updates', 'Advance and remaining payment notices'],
  ['butcherMessages', 'Butcher messages', 'Messages and arrival updates'],
  ['reviewNotifications', 'Review notifications', 'Reminders after completed bookings'],
  ['promotions', 'Promotional notifications', 'Occasional QurbaniX offers'],
];

const backendPreferenceKeys = {
  bookingUpdates: 'booking_updates',
  paymentUpdates: 'payment_updates',
  butcherMessages: 'butcher_messages',
  reviewNotifications: 'review_notifications',
  promotions: 'promotions',
};

const emptyAccount = {
  profile: { id: '', name: '', phone: '', email: '', memberSince: '', avatar: '' },
  addresses: [],
  notifications: { bookingUpdates: true, paymentUpdates: true, butcherMessages: true, reviewNotifications: true, promotions: false },
};

function mapApiAccount(response) {
  const user = response?.user || {};
  const backendPreferences = response?.preferences || {};
  const addresses = (user.customer_addresses || user.customerAddresses || [])
    .map((address) => ({
      ...address,
      id: String(address.id),
      is_default: Boolean(address.is_default),
    }))
    .sort((first, second) => Number(second.is_default) - Number(first.is_default));

  return {
    profile: {
      id: String(user.id || ''),
      name: user.name || '',
      phone: user.phone || '',
      email: user.email || '',
      memberSince: user.created_at ? new Date(`${String(user.created_at).slice(0, 10)}T12:00:00`).toLocaleDateString('en-BD', { month: 'long', year: 'numeric' }) : '',
      avatar: '',
    },
    addresses,
    notifications: Object.fromEntries(Object.entries(backendPreferenceKeys).map(([key, backendKey]) => [key, backendPreferences[backendKey] ?? emptyAccount.notifications[key]])),
  };
}

function toBackendPreferences(preferences) {
  return Object.fromEntries(Object.entries(backendPreferenceKeys).map(([key, backendKey]) => [backendKey, Boolean(preferences[key])]));
}

function ProfileField({ label, name, value, onChange, type = 'text', required = false, placeholder = '', disabled = false }) {
  return (
    <label className="customer-profile-field">
      <span>{label}{required ? ' *' : ''}</span>
      <input name={name} type={type} value={value || ''} onChange={onChange} required={required} placeholder={placeholder} disabled={disabled} />
    </label>
  );
}

function getProfileDraft(account) {
  const primaryAddress = account.addresses[0] || {};
  return {
    ...account.profile,
    address: primaryAddress.address || '',
    area: primaryAddress.area || '',
    city: primaryAddress.city || '',
  };
}

function CustomerProfile() {
  const navigate = useNavigate();
  const { logout: logoutFromAuth } = useAuth();
  const [account, setAccount] = useState(emptyAccount);
  const [profileDraft, setProfileDraft] = useState(() => getProfileDraft(emptyAccount));
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [bookingsError, setBookingsError] = useState('');
  const [reviewsError, setReviewsError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressDraft, setAddressDraft] = useState(null);
  const [notice, setNotice] = useState('');
  const [profileError, setProfileError] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [deletingAddressId, setDeletingAddressId] = useState(null);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [retryKey, setRetryKey] = useState(0);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  useEffect(() => {
    let isCurrentRequest = true;
    setIsLoading(true);
    setProfileError('');
    setBookingsError('');
    setReviewsError('');
    Promise.allSettled([
      api.customerProfile(),
      api.customerBookings({ per_page: 100 }),
      api.customerReviews({ per_page: 100 }),
    ]).then(([profileResult, bookingsResult, reviewsResult]) => {
      if (!isCurrentRequest) return;
      if (profileResult.status === 'fulfilled') {
        const loadedAccount = mapApiAccount(profileResult.value);
        setAccount(loadedAccount);
        setProfileDraft(getProfileDraft(loadedAccount));
      } else {
        setProfileError(profileResult.reason?.message || 'Unable to load your profile.');
      }
      if (bookingsResult.status === 'fulfilled') {
        setBookings(bookingsResult.value.data || []);
      } else {
        setBookingsError(bookingsResult.reason?.message || 'Unable to load your booking summary.');
      }
      if (reviewsResult.status === 'fulfilled') {
        setReviews(reviewsResult.value.data || []);
      } else {
        setReviewsError(reviewsResult.reason?.message || 'Unable to load your review summary.');
      }
    }).finally(() => {
      if (isCurrentRequest) setIsLoading(false);
    });
    return () => {
      isCurrentRequest = false;
    };
  }, [retryKey]);

  const completedBookings = bookings.filter((booking) => booking.status === 'Completed').length;
  const pendingBookings = bookings.filter((booking) => booking.status === 'Pending').length;
  const primaryAddress = account.addresses[0];

  const refreshAccount = async () => {
    const response = await api.customerProfile();
    const updatedAccount = mapApiAccount(response);
    setAccount(updatedAccount);
    return updatedAccount;
  };

  const updateProfileDraft = (event) => {
    const { name, value } = event.target;
    setProfileDraft((current) => ({ ...current, [name]: value }));
    setProfileError('');
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    if (!profileDraft.name.trim()) {
      setProfileError('Enter your full name.');
      return;
    }
    const nextAddress = {
      address: profileDraft.address.trim(),
      area: profileDraft.area.trim(),
      city: profileDraft.city.trim(),
    };
    const addressChanged = primaryAddress
      ? nextAddress.address !== primaryAddress.address || nextAddress.area !== primaryAddress.area || nextAddress.city !== primaryAddress.city
      : Object.values(nextAddress).some(Boolean);
    if (addressChanged && Object.values(nextAddress).some((value) => !value)) {
      setProfileError('Enter the full address, area, and city to save this location.');
      return;
    }

    setIsSavingProfile(true);
    setProfileError('');
    try {
      if (addressChanged) {
        const addressPayload = {
          ...(primaryAddress ? {} : { label: 'Home', is_default: true }),
          ...nextAddress,
          ...(primaryAddress ? { label: primaryAddress.label || 'Home', instructions: primaryAddress.instructions || '', is_default: primaryAddress.is_default } : { instructions: '' }),
        };
        if (primaryAddress) await api.updateCustomerAddress(primaryAddress.id, addressPayload);
        else await api.addresses(addressPayload);
      }
      await api.updateCustomerProfile({
        name: profileDraft.name.trim(),
        email: profileDraft.email.trim() || null,
        preferences: toBackendPreferences(account.notifications),
      });
      const updatedAccount = await refreshAccount();
      setProfileDraft(getProfileDraft(updatedAccount));
      setIsEditingProfile(false);
      setNotice('Profile updated successfully.');
    } catch (requestError) {
      setProfileError(requestError?.message || 'Unable to save your profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const cancelProfileEdit = () => {
    setProfileDraft(getProfileDraft(account));
    setProfileError('');
    setIsEditingProfile(false);
  };

  const changePhoto = (event) => {
    const [file] = event.target.files || [];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setNotice('Choose an image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setNotice('Choose an image smaller than 2 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result);
      setNotice('Photo preview changed for this session; profile photos are not stored by the account API.');
    };
    reader.readAsDataURL(file);
  };

  const startAddressEdit = (address) => {
    setAddressDraft(address ? { ...address } : { label: 'Home', address: '', area: '', city: '', instructions: '' });
    setEditingAddressId(address?.id || 'new');
    setNotice('');
  };

  const updateAddressDraft = (event) => {
    const { name, value } = event.target;
    setAddressDraft((current) => ({ ...current, [name]: value }));
  };

  const saveAddress = async (event) => {
    event.preventDefault();
    if (!addressDraft.address.trim() || !addressDraft.area.trim() || !addressDraft.city.trim()) {
      setProfileError('Enter the full address, area, and city.');
      return;
    }
    setIsSavingAddress(true);
    setProfileError('');
    try {
      const payload = {
        label: addressDraft.label?.trim() || 'Home',
        address: addressDraft.address.trim(),
        area: addressDraft.area.trim(),
        city: addressDraft.city.trim(),
        instructions: addressDraft.instructions?.trim() || '',
        is_default: Boolean(addressDraft.is_default || (editingAddressId === 'new' && !account.addresses.length)),
      };
      if (editingAddressId === 'new') await api.addresses(payload);
      else await api.updateCustomerAddress(editingAddressId, payload);
      const updatedAccount = await refreshAccount();
      setProfileDraft(getProfileDraft(updatedAccount));
      setEditingAddressId(null);
      setAddressDraft(null);
      setNotice('Saved address updated.');
    } catch (requestError) {
      setProfileError(requestError?.message || 'Unable to save this address.');
    } finally {
      setIsSavingAddress(false);
    }
  };

  const deleteAddress = async (addressId) => {
    setProfileError('');
    setDeletingAddressId(addressId);
    try {
      await api.deleteCustomerAddress(addressId);
      const updatedAccount = await refreshAccount();
      setProfileDraft(getProfileDraft(updatedAccount));
      setNotice('Saved address deleted.');
    } catch (requestError) {
      setProfileError(requestError?.message || 'Unable to delete this address.');
    } finally {
      setDeletingAddressId(null);
    }
  };

  const updateNotification = async (key, checked) => {
    const nextPreferences = { ...account.notifications, [key]: checked };
    setIsSavingPreferences(true);
    setProfileError('');
    try {
      const response = await api.updateCustomerProfile({ preferences: toBackendPreferences(nextPreferences) });
      setAccount(mapApiAccount(response));
      setNotice('Notification preference updated.');
    } catch (requestError) {
      setProfileError(requestError?.message || 'Unable to save this preference.');
    } finally {
      setIsSavingPreferences(false);
    }
  };

  const logout = async () => {
    await logoutFromAuth();
    navigate('/login/customer', { replace: true });
  };

  return (
    <div className="find-butcher-page customer-account-page">
      <CustomerNavigation />
      <main className="customer-account-main">
        <header className="customer-account-heading">
          <div><p className="finder-eyebrow">Customer account</p><h1>Profile &amp; Settings</h1><p>Manage your personal details, saved locations, and account preferences.</p></div>
          <Link className="booking-secondary-button" to="/dashboard/customer">Customer home</Link>
        </header>
        {notice ? <p className="customer-account-notice" role="status">{notice}</p> : null}
        {profileError ? <p className="customer-account-error" role="alert">{profileError}</p> : null}

        {isLoading ? <p className="customer-account-empty" role="status">Loading profile...</p> : null}
        {!isLoading && !account.profile.id ? <section className="customer-account-panel"><p>Unable to display your account profile.</p><button className="booking-secondary-button" type="button" onClick={() => setRetryKey((current) => current + 1)}>Try again</button></section> : null}
        {!isLoading && account.profile.id ? <>

        <section className="customer-account-panel customer-profile-overview">
          <div className="customer-profile-identity">
            {avatarPreview ? <img className="customer-profile-avatar" src={avatarPreview} alt={`${account.profile.name} profile preview`} /> : <span className="customer-profile-avatar customer-profile-initials">{account.profile.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span>}
            <div><p className="finder-eyebrow">Profile</p><h2>{account.profile.name}</h2><p>{account.profile.phone}</p><span className="customer-verification-state">Customer account</span></div>
            <label className="customer-photo-upload">Change photo<input type="file" accept="image/*" onChange={changePhoto} /></label>
          </div>
          <div className="customer-profile-summary" aria-label="Account summary">
            <div><strong>{bookingsError ? '—' : bookings.length}</strong><span>Total bookings</span></div>
            <div><strong>{bookingsError ? '—' : completedBookings}</strong><span>Completed</span></div>
            <div><strong>{bookingsError ? '—' : pendingBookings}</strong><span>Pending</span></div>
            <div><strong>{reviewsError ? '—' : reviews.length}</strong><span>Reviews written</span></div>
          </div>
          {bookingsError ? <p className="customer-account-error" role="alert">{bookingsError} <button type="button" onClick={() => setRetryKey((current) => current + 1)}>Retry</button></p> : null}
          {reviewsError ? <p className="customer-account-error" role="alert">{reviewsError} <button type="button" onClick={() => setRetryKey((current) => current + 1)}>Retry</button></p> : null}
        </section>

        <div className="customer-account-grid">
          <section className="customer-account-panel">
            <div className="customer-account-section-heading"><div><p className="finder-eyebrow">Personal information</p><h2>Profile details</h2></div>{!isEditingProfile ? <button className="booking-secondary-button" type="button" onClick={() => { setProfileDraft(getProfileDraft(account)); setIsEditingProfile(true); }}>Edit Profile</button> : null}</div>
            {isEditingProfile ? (
              <form className="customer-account-form" onSubmit={saveProfile}>
                <ProfileField label="Full name" name="name" value={profileDraft.name} onChange={updateProfileDraft} required />
                <ProfileField label="Phone number" name="phone" value={profileDraft.phone} disabled />
                <ProfileField label="Email" name="email" value={profileDraft.email} onChange={updateProfileDraft} type="email" />
                <ProfileField label="Full address" name="address" value={profileDraft.address} onChange={updateProfileDraft} />
                <ProfileField label="Area" name="area" value={profileDraft.area} onChange={updateProfileDraft} />
                <ProfileField label="City" name="city" value={profileDraft.city} onChange={updateProfileDraft} />
                <div className="customer-account-form-actions"><button className="booking-primary-button" type="submit" disabled={isSavingProfile}>{isSavingProfile ? 'Saving...' : 'Save Changes'}</button><button className="booking-secondary-button" type="button" onClick={cancelProfileEdit}>Cancel</button></div>
              </form>
            ) : (
              <dl className="customer-account-data-list">
                <div><dt>Full name</dt><dd>{account.profile.name}</dd></div><div><dt>Phone number</dt><dd>{account.profile.phone}</dd></div><div><dt>Email</dt><dd>{account.profile.email || 'Not added'}</dd></div><div><dt>Location</dt><dd>{primaryAddress ? `${primaryAddress.area}, ${primaryAddress.city}` : 'No saved location'}</dd></div><div><dt>Member since</dt><dd>{account.profile.memberSince || 'Not available'}</dd></div><div><dt>Account type</dt><dd>Customer</dd></div>
              </dl>
            )}
          </section>

          <section className="customer-account-panel customer-address-panel">
            <div className="customer-account-section-heading"><div><p className="finder-eyebrow">Service locations</p><h2>Saved Addresses</h2></div>{editingAddressId === null ? <button className="booking-secondary-button" type="button" onClick={() => startAddressEdit(null)}>Add Address</button> : null}</div>
            {account.addresses.map((address) => editingAddressId === address.id ? (
              <form className="customer-address-form" key={address.id} onSubmit={saveAddress}>
                <ProfileField label="Address label" name="label" value={addressDraft.label} onChange={updateAddressDraft} />
                <ProfileField label="Full address" name="address" value={addressDraft.address} onChange={updateAddressDraft} required />
                <ProfileField label="Area" name="area" value={addressDraft.area} onChange={updateAddressDraft} required />
                <ProfileField label="City" name="city" value={addressDraft.city} onChange={updateAddressDraft} required />
                <label className="customer-profile-field customer-profile-field-full"><span>Additional instructions</span><textarea name="instructions" rows="2" value={addressDraft.instructions} onChange={updateAddressDraft} /></label>
                <div className="customer-account-form-actions"><button className="booking-primary-button" type="submit" disabled={isSavingAddress}>{isSavingAddress ? 'Saving...' : 'Save Address'}</button><button className="booking-secondary-button" type="button" onClick={() => { setEditingAddressId(null); setAddressDraft(null); }}>Cancel</button></div>
              </form>
            ) : (
              <article className="customer-saved-address" key={address.id}>
                <div><p className="customer-address-label">{address.label || 'Saved address'}</p><strong>{address.address}</strong><span>{address.area}, {address.city}</span><small>{address.instructions || 'No additional instructions'}</small></div>
                <div className="customer-address-actions"><button className="customer-text-action" type="button" onClick={() => startAddressEdit(address)}>Edit</button><button className="customer-text-action is-danger" type="button" disabled={deletingAddressId === address.id} onClick={() => deleteAddress(address.id)}>{deletingAddressId === address.id ? 'Deleting...' : 'Delete'}</button></div>
              </article>
            ))}
            {editingAddressId === 'new' ? (
              <form className="customer-address-form" onSubmit={saveAddress}>
                <ProfileField label="Address label" name="label" value={addressDraft.label} onChange={updateAddressDraft} />
                <ProfileField label="Full address" name="address" value={addressDraft.address} onChange={updateAddressDraft} required />
                <ProfileField label="Area" name="area" value={addressDraft.area} onChange={updateAddressDraft} required />
                <ProfileField label="City" name="city" value={addressDraft.city} onChange={updateAddressDraft} required />
                <label className="customer-profile-field customer-profile-field-full"><span>Additional instructions</span><textarea name="instructions" rows="2" value={addressDraft.instructions} onChange={updateAddressDraft} /></label>
                <div className="customer-account-form-actions"><button className="booking-primary-button" type="submit" disabled={isSavingAddress}>{isSavingAddress ? 'Saving...' : 'Save Address'}</button><button className="booking-secondary-button" type="button" onClick={() => { setEditingAddressId(null); setAddressDraft(null); }}>Cancel</button></div>
              </form>
            ) : null}
            {!account.addresses.length && editingAddressId === null ? <p className="customer-account-empty">No saved addresses yet.</p> : null}
          </section>

          <section className="customer-account-panel customer-notifications-panel">
            <div className="customer-account-section-heading"><div><p className="finder-eyebrow">Preferences</p><h2>Notifications</h2></div></div>
            <div className="customer-notification-list">
              {notificationOptions.map(([key, label, description]) => (
                <label className="customer-notification-row" key={key}><span><strong>{label}</strong><small>{description}</small></span><input type="checkbox" role="switch" checked={Boolean(account.notifications[key])} disabled={isSavingPreferences} onChange={(event) => updateNotification(key, event.target.checked)} /></label>
              ))}
            </div>
          </section>

          <section className="customer-account-panel customer-security-panel">
            <div className="customer-account-section-heading"><div><p className="finder-eyebrow">Access &amp; security</p><h2>Login information</h2></div></div>
            <dl className="customer-account-data-list"><div><dt>Registered phone</dt><dd>{account.profile.phone}</dd></div><div><dt>Login method</dt><dd>Phone + OTP</dd></div><div><dt>Account type</dt><dd>Customer</dd></div></dl>
          </section>
        </div>

        <section className="customer-account-panel customer-account-actions">
          <div><p className="finder-eyebrow">Account actions</p><h2>Manage account</h2></div>
          <div><button className="booking-secondary-button" type="button" onClick={logout}>Log out</button><button className="customer-delete-button" type="button" onClick={() => setShowDeleteConfirmation(true)}>Delete Account</button></div>
        </section>
        </> : null}
      </main>

      {showDeleteConfirmation ? (
        <div className="customer-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowDeleteConfirmation(false); }}>
          <section className="customer-delete-modal" role="dialog" aria-modal="true" aria-labelledby="customer-delete-title">
            <p className="finder-eyebrow">Account action</p><h2 id="customer-delete-title">Account deletion is unavailable</h2><p>Account deletion is not available from this page. No account data has been deleted.</p>
            <div className="customer-account-form-actions"><button className="booking-secondary-button" type="button" onClick={() => setShowDeleteConfirmation(false)}>Close</button></div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

export default CustomerProfile;
