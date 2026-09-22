import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../components/butcher/ButcherSidebar';
import ButcherSidebar from '../../components/butcher/ButcherSidebar';
import ProfileForm from '../../components/butcher/ProfileForm';
import ProfileOverview from '../../components/butcher/ProfileOverview';
import ProfileVerification from '../../components/butcher/ProfileVerification';
import { initialProfile, profileMeta } from '../../components/butcher/profileData';
import '../dashboard/ButcherDashboard.css';
import './Profile.css';

function Profile() {
  const [profile, setProfile] = useState(initialProfile);
  const [saved, setSaved] = useState(false);
  const [photoChanged, setPhotoChanged] = useState(false);

  const saveProfile = () => { setSaved(true); window.setTimeout(() => setSaved(false), 2800); };
  const resetProfile = () => { setProfile(initialProfile); setSaved(false); };

  return <div className="butcher-dashboard profile-page"><ButcherSidebar /><main className="butcher-main"><header className="butcher-topbar profile-topbar"><div><p className="eyebrow">Butcher workspace</p><h1>Profile</h1><p>Manage your personal and professional information.</p></div><div className="butcher-user"><button type="button" className="butcher-notification" aria-label="View notifications"><Icon name="inbox" size={18} /><span className="notification-dot" /></button><span className="butcher-avatar">KA</span><div className="butcher-user-copy"><strong>Karim Ahmed</strong><span>Verified Butcher</span></div></div></header><div className="profile-toolbar"><div><p className="eyebrow">Profile management</p><h2>Your professional profile</h2></div><Link to="/dashboard/butcher" className="profile-dashboard-link">← Dashboard</Link></div><ProfileOverview profile={profile} meta={profileMeta} onChangePhoto={() => setPhotoChanged(true)} /><div className="profile-content-grid"><ProfileForm profile={profile} onChange={setProfile} onSave={saveProfile} onReset={resetProfile} /><ProfileVerification meta={profileMeta} /></div><div className="profile-save-note">{saved ? 'Profile updated successfully.' : photoChanged ? 'Photo change is a UI-only placeholder.' : 'Changes are saved for this session only.'}</div></main></div>;
}

export default Profile;