function ProfileVerification({ profile }) {
  const status = profile.verificationStatus.replaceAll('_', ' ');
  const verifiedDate = profile.verifiedAt ? new Date(profile.verifiedAt).toLocaleDateString() : 'Not recorded';

  return <div className="profile-side-column"><section className="butcher-panel verification-panel"><div className="panel-heading"><div><p className="eyebrow">Trust and safety</p><h2>Verification</h2></div></div><p className="verification-copy">Your current verification status is {status}.</p><div className="verification-list"><div><span>Verification status</span><strong>{status}</strong></div><div><span>Verified on</span><strong>{verifiedDate}</strong></div></div></section><section className="butcher-panel account-panel"><div className="panel-heading"><div><p className="eyebrow">Your account</p><h2>Account information</h2></div></div><div className="account-list"><div><span>Account role</span><strong>{profile.role || 'Not provided'}</strong></div><div><span>Phone</span><strong>{profile.phone || 'Not provided'}</strong></div><div><span>Email</span><strong>{profile.email || 'Not provided'}</strong></div></div></section></div>;
}

export default ProfileVerification;