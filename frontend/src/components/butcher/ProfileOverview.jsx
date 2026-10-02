function ProfileOverview({ profile, meta, onChangePhoto }) {
  const initials = profile.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  const status = profile.verificationStatus.replaceAll('_', ' ');

  return <section className="profile-overview butcher-panel"><div className="profile-identity"><div className="profile-photo">{initials}</div><div><p className="eyebrow">Professional profile</p><h2>{profile.name || 'Your profile'}</h2><span className="profile-verified"><i /> {status}</span><button type="button" className="profile-photo-button" onClick={onChangePhoto}>Change Photo</button></div></div><div className="profile-facts"><div><span>Location</span><strong>{[profile.area, profile.city].filter(Boolean).join(', ') || 'Not provided'}</strong></div><div><span>Service areas</span><strong>{profile.serviceAreas.length}</strong></div><div><span>Specializations</span><strong>{profile.specializations.length}</strong></div><div><span>Daily capacity</span><strong>{profile.dailyCapacity ?? 'Not set'}</strong></div></div></section>;
}

export default ProfileOverview;