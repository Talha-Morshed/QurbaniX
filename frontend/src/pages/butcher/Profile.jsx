import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import { useAuth } from '../../auth/AuthContext';
import ButcherSidebar from '../../components/butcher/ButcherSidebar';
import ProfileForm from '../../components/butcher/ProfileForm';
import ProfileOverview from '../../components/butcher/ProfileOverview';
import ProfileVerification from '../../components/butcher/ProfileVerification';
import { profileFromApi, profileToApi } from '../../components/butcher/profileData';
import '../dashboard/ButcherDashboard.css';
import './Profile.css';

function getErrorMessage(error) {
  const validationMessage = Object.values(error?.errors || {}).flat()[0];
  return validationMessage || error?.message || 'Unable to load your profile. Please try again.';
}

function copyProfile(profile) {
  return {
    ...profile,
    serviceAreas: [...profile.serviceAreas],
    specializations: [...profile.specializations],
  };
}

function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [savedProfile, setSavedProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [saved, setSaved] = useState(false);
  const [photoChanged, setPhotoChanged] = useState(false);
  const [saveError, setSaveError] = useState('');

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await api.butcherProfile();
      const currentProfile = profileFromApi(response?.profile, user?.role);
      setProfile(currentProfile);
      setSavedProfile(copyProfile(currentProfile));
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    if (user?.role !== 'butcher') {
      setError('A butcher account is required to view this profile.');
      setIsLoading(false);
      return;
    }

    loadProfile();
  }, [loadProfile, user?.role]);

  async function saveProfile() {
    setIsSaving(true);
    setFormError('');
    setSaveError('');
    setSaved(false);
    let updateSucceeded = false;

    try {
      await api.updateButcherProfile(profileToApi(profile));
      updateSucceeded = true;
      const response = await api.butcherProfile();
      const updatedProfile = profileFromApi(response?.profile, user?.role);
      setProfile(updatedProfile);
      setSavedProfile(copyProfile(updatedProfile));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2800);
    } catch (saveRequestError) {
      const message = getErrorMessage(saveRequestError);
      if (updateSucceeded) {
        setSaveError(`Your update was accepted, but the latest profile could not be loaded. ${message}`);
      } else if (saveRequestError?.status >= 400) {
        setFormError(message);
      } else {
        setSaveError(`The update may have been saved, but the latest profile could not be loaded. ${message}`);
      }
    } finally {
      setIsSaving(false);
    }
  }

  function resetProfile() {
    if (savedProfile) setProfile(copyProfile(savedProfile));
    setFormError('');
    setSaveError('');
    setSaved(false);
  }

  const initials = (profile?.name || user?.name || '').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

  return (
    <div className="butcher-dashboard profile-page">
      <ButcherSidebar />
      <main className="butcher-main">
        <header className="butcher-topbar profile-topbar">
          <div>
            <p className="eyebrow">Butcher workspace</p>
            <h1>Profile</h1>
            <p>Manage your personal and professional information.</p>
          </div>
          <div className="butcher-user">
            <span className="butcher-avatar">{initials}</span>
            <div className="butcher-user-copy">
              <strong>{profile?.name || user?.name}</strong>
              <span>{profile?.verificationStatus.replaceAll('_', ' ') || 'Butcher'}</span>
            </div>
          </div>
        </header>
        <div className="profile-toolbar">
          <div>
            <p className="eyebrow">Profile management</p>
            <h2>Your professional profile</h2>
          </div>
          <Link to="/dashboard/butcher" className="profile-dashboard-link">← Dashboard</Link>
        </div>
        {isLoading ? (
          <p className="profile-loading" role="status">Loading your profile…</p>
        ) : error ? (
          <p className="profile-error" role="alert">
            {error} <button type="button" onClick={loadProfile}>Retry</button>
          </p>
        ) : profile ? (
          <>
            <ProfileOverview profile={profile} onChangePhoto={() => setPhotoChanged(true)} />
            <div className="profile-content-grid">
              <ProfileForm
                profile={profile}
                onChange={setProfile}
                onSave={saveProfile}
                onReset={resetProfile}
                isSaving={isSaving}
                error={formError}
              />
              <ProfileVerification profile={profile} />
            </div>
            <div
              className={`profile-save-note${saveError ? ' profile-save-error' : ''}`}
              role={saveError ? 'alert' : undefined}
            >
              {saveError || (saved ? 'Profile updated successfully.' : photoChanged ? 'Photo change is a UI-only placeholder.' : '')}
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}

export default Profile;