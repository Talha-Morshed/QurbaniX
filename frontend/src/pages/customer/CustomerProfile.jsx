import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clearToken } from '../../api';
import { getCustomerBookings } from '../../components/customer/customerBookings';
import { getCustomerReviews } from '../../components/customer/customerBookings';
import { getCustomerAccount, saveCustomerAccount } from '../../components/customer/customerAccount';
import { validatePhone } from '../../utils/validation';
import { CustomerNavigation } from './FindButchers';
import './CustomerProfile.css';

const notificationOptions = [
  ['bookingUpdates', 'Booking updates', 'Booking requests and schedule changes'],
  ['paymentUpdates', 'Payment updates', 'Advance and remaining payment notices'],
  ['butcherMessages', 'Butcher messages', 'Messages and arrival updates'],
  ['reviewNotifications', 'Review notifications', 'Reminders after completed bookings'],
  ['promotions', 'Promotional notifications', 'Occasional QurbaniX offers'],
];

function ProfileField({ label, name, value, onChange, type = 'text', required = false, placeholder = '' }) {
  return (
    <label className="customer-profile-field">
      <span>{label}{required ? ' *' : ''}</span>
      <input name={name} type={type} value={value || ''} onChange={onChange} required={required} placeholder={placeholder} />
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
  const [account, setAccount] = useState(getCustomerAccount);
  const [profileDraft, setProfileDraft] = useState(() => getProfileDraft(getCustomerAccount()));
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressDraft, setAddressDraft] = useState(null);
  const [notice, setNotice] = useState('');
  const [profileError, setProfileError] = useState('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const bookings = getCustomerBookings();
  const reviews = getCustomerReviews();
  const completedBookings = bookings.filter((booking) => booking.status === 'Completed').length;
  const pendingBookings = bookings.filter((booking) => booking.status === 'Pending').length;
  const primaryAddress = account.addresses[0];

  const persistAccount = (nextAccount) => {
    setAccount(saveCustomerAccount(nextAccount));
  };

  const updateProfileDraft = (event) => {
    const { name, value } = event.target;
    setProfileDraft((current) => ({ ...current, [name]: value }));
    setProfileError('');
  };

  const saveProfile = (event) => {
    event.preventDefault();
    if (!profileDraft.name.trim()) {
      setProfileError('Enter your full name.');
      return;
    }
    if (!validatePhone(profileDraft.phone)) {
      setProfileError('Enter a valid Bangladesh phone number (01XXXXXXXXX).');
      return;
    }
    const addresses = primaryAddress
      ? account.addresses.map((address) => address.id === primaryAddress.id ? { ...address, address: profileDraft.address.trim(), area: profileDraft.area.trim(), city: profileDraft.city.trim() } : address)
      : profileDraft.address.trim() ? [{ id: `address-${Date.now()}`, label: 'Home', address: profileDraft.address.trim(), area: profileDraft.area.trim(), city: profileDraft.city.trim(), instructions: '' }] : [];
    persistAccount({
      ...account,
      profile: { ...account.profile, name: profileDraft.name.trim(), phone: profileDraft.phone.trim(), email: profileDraft.email.trim() },
      addresses,
    });
    setIsEditingProfile(false);
    setNotice('Profile updated successfully.');
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
      persistAccount({ ...account, profile: { ...account.profile, avatar: reader.result } });
      setProfileDraft((current) => ({ ...current, avatar: reader.result }));
      setNotice('Profile photo saved on this device.');
    };
    reader.readAsDataURL(file);
  };

  const startAddressEdit = (address) => {
    setAddressDraft(address ? { ...address } : { id: `address-${Date.now()}`, label: 'Home', address: '', area: '', city: '', instructions: '' });
    setEditingAddressId(address?.id || 'new');
    setNotice('');
  };

  const updateAddressDraft = (event) => {
    const { name, value } = event.target;
    setAddressDraft((current) => ({ ...current, [name]: value }));
  };

  const saveAddress = (event) => {
    event.preventDefault();
    if (!addressDraft.address.trim() || !addressDraft.area.trim() || !addressDraft.city.trim()) return;
    const addresses = editingAddressId === 'new'
      ? [...account.addresses, addressDraft]
      : account.addresses.map((address) => address.id === editingAddressId ? addressDraft : address);
    const nextAccount = { ...account, addresses };
    persistAccount(nextAccount);
    setProfileDraft(getProfileDraft(nextAccount));
    setEditingAddressId(null);
    setAddressDraft(null);
    setNotice('Saved address updated.');
  };

  const deleteAddress = (addressId) => {
    const nextAccount = { ...account, addresses: account.addresses.filter((address) => address.id !== addressId) };
    persistAccount(nextAccount);
    setProfileDraft(getProfileDraft(nextAccount));
    setNotice('Saved address deleted.');
  };

  const updateNotification = (key, checked) => {
    persistAccount({ ...account, notifications: { ...account.notifications, [key]: checked } });
  };

  const logout = () => {
    clearToken();
    navigate('/login/customer');
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

        <section className="customer-account-panel customer-profile-overview">
          <div className="customer-profile-identity">
            {account.profile.avatar ? <img className="customer-profile-avatar" src={account.profile.avatar} alt={`${account.profile.name} profile`} /> : <span className="customer-profile-avatar customer-profile-initials">{account.profile.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span>}
            <div><p className="finder-eyebrow">Profile</p><h2>{account.profile.name}</h2><p>{account.profile.phone}</p><span className={`customer-verification-state ${account.profile.verified ? 'is-verified' : ''}`}>{account.profile.verified ? 'Verified account' : 'Verification pending'}</span></div>
            <label className="customer-photo-upload">Change photo<input type="file" accept="image/*" onChange={changePhoto} /></label>
          </div>
          <div className="customer-profile-summary" aria-label="Account summary">
            <div><strong>{bookings.length}</strong><span>Total bookings</span></div>
            <div><strong>{completedBookings}</strong><span>Completed</span></div>
            <div><strong>{pendingBookings}</strong><span>Pending</span></div>
            <div><strong>{reviews.length}</strong><span>Reviews written</span></div>
          </div>
        </section>

        <div className="customer-account-grid">
          <section className="customer-account-panel">
            <div className="customer-account-section-heading"><div><p className="finder-eyebrow">Personal information</p><h2>Profile details</h2></div>{!isEditingProfile ? <button className="booking-secondary-button" type="button" onClick={() => { setProfileDraft({ ...account.profile }); setIsEditingProfile(true); }}>Edit Profile</button> : null}</div>
            {isEditingProfile ? (
              <form className="customer-account-form" onSubmit={saveProfile}>
                <ProfileField label="Full name" name="name" value={profileDraft.name} onChange={updateProfileDraft} required />
                <ProfileField label="Phone number" name="phone" value={profileDraft.phone} onChange={updateProfileDraft} required />
                <ProfileField label="Email" name="email" value={profileDraft.email} onChange={updateProfileDraft} type="email" />
                <ProfileField label="Full address" name="address" value={profileDraft.address} onChange={updateProfileDraft} />
                <ProfileField label="Area" name="area" value={profileDraft.area} onChange={updateProfileDraft} />
                <ProfileField label="City" name="city" value={profileDraft.city} onChange={updateProfileDraft} />
                {profileError ? <p className="customer-account-error" role="alert">{profileError}</p> : null}
                <div className="customer-account-form-actions"><button className="booking-primary-button" type="submit">Save Changes</button><button className="booking-secondary-button" type="button" onClick={cancelProfileEdit}>Cancel</button></div>
              </form>
            ) : (
              <dl className="customer-account-data-list">
                <div><dt>Full name</dt><dd>{account.profile.name}</dd></div><div><dt>Phone number</dt><dd>{account.profile.phone}</dd></div><div><dt>Email</dt><dd>{account.profile.email || 'Not added'}</dd></div><div><dt>Location</dt><dd>{primaryAddress ? `${primaryAddress.area}, ${primaryAddress.city}` : 'No saved location'}</dd></div><div><dt>Member since</dt><dd>{account.profile.memberSince}</dd></div><div><dt>Account verification</dt><dd>{account.profile.verified ? 'Verified' : 'Not verified'}</dd></div>
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
                <div className="customer-account-form-actions"><button className="booking-primary-button" type="submit">Save Address</button><button className="booking-secondary-button" type="button" onClick={() => { setEditingAddressId(null); setAddressDraft(null); }}>Cancel</button></div>
              </form>
            ) : (
              <article className="customer-saved-address" key={address.id}>
                <div><p className="customer-address-label">{address.label || 'Saved address'}</p><strong>{address.address}</strong><span>{address.area}, {address.city}</span><small>{address.instructions || 'No additional instructions'}</small></div>
                <div className="customer-address-actions"><button className="customer-text-action" type="button" onClick={() => startAddressEdit(address)}>Edit</button><button className="customer-text-action is-danger" type="button" onClick={() => deleteAddress(address.id)}>Delete</button></div>
              </article>
            ))}
            {editingAddressId === 'new' ? (
              <form className="customer-address-form" onSubmit={saveAddress}>
                <ProfileField label="Address label" name="label" value={addressDraft.label} onChange={updateAddressDraft} />
                <ProfileField label="Full address" name="address" value={addressDraft.address} onChange={updateAddressDraft} required />
                <ProfileField label="Area" name="area" value={addressDraft.area} onChange={updateAddressDraft} required />
                <ProfileField label="City" name="city" value={addressDraft.city} onChange={updateAddressDraft} required />
                <label className="customer-profile-field customer-profile-field-full"><span>Additional instructions</span><textarea name="instructions" rows="2" value={addressDraft.instructions} onChange={updateAddressDraft} /></label>
                <div className="customer-account-form-actions"><button className="booking-primary-button" type="submit">Save Address</button><button className="booking-secondary-button" type="button" onClick={() => { setEditingAddressId(null); setAddressDraft(null); }}>Cancel</button></div>
              </form>
            ) : null}
            {!account.addresses.length && editingAddressId === null ? <p className="customer-account-empty">No saved addresses yet.</p> : null}
          </section>

          <section className="customer-account-panel customer-notifications-panel">
            <div className="customer-account-section-heading"><div><p className="finder-eyebrow">Preferences</p><h2>Notifications</h2></div></div>
            <div className="customer-notification-list">
              {notificationOptions.map(([key, label, description]) => (
                <label className="customer-notification-row" key={key}><span><strong>{label}</strong><small>{description}</small></span><input type="checkbox" role="switch" checked={Boolean(account.notifications[key])} onChange={(event) => updateNotification(key, event.target.checked)} /></label>
              ))}
            </div>
          </section>

          <section className="customer-account-panel customer-security-panel">
            <div className="customer-account-section-heading"><div><p className="finder-eyebrow">Access &amp; security</p><h2>Login information</h2></div></div>
            <dl className="customer-account-data-list"><div><dt>Registered phone</dt><dd>{account.profile.phone}</dd></div><div><dt>Login method</dt><dd>Phone + OTP</dd></div><div><dt>Account verification</dt><dd>{account.profile.verified ? 'Verified' : 'Verification pending'}</dd></div></dl>
          </section>
        </div>

        <section className="customer-account-panel customer-account-actions">
          <div><p className="finder-eyebrow">Account actions</p><h2>Manage account</h2></div>
          <div><button className="booking-secondary-button" type="button" onClick={logout}>Log out</button><button className="customer-delete-button" type="button" onClick={() => setShowDeleteConfirmation(true)}>Delete Account</button></div>
        </section>
      </main>

      {showDeleteConfirmation ? (
        <div className="customer-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowDeleteConfirmation(false); }}>
          <section className="customer-delete-modal" role="dialog" aria-modal="true" aria-labelledby="customer-delete-title">
            <p className="finder-eyebrow">Account action</p><h2 id="customer-delete-title">Are you sure you want to delete your account?</h2><p>This is a mock confirmation only. No account or booking data will be deleted.</p>
            <div className="customer-account-form-actions"><button className="booking-secondary-button" type="button" onClick={() => setShowDeleteConfirmation(false)}>Cancel</button><button className="customer-delete-button" type="button" onClick={() => { setShowDeleteConfirmation(false); setNotice('Mock account deletion confirmed. No account data was deleted.'); }}>Confirm Delete</button></div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

export default CustomerProfile;
