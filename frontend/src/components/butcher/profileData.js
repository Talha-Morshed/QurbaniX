export function profileFromApi(profile, authenticatedRole = '') {
  if (!profile?.user) {
    throw new Error('The server did not return a butcher account with this profile.');
  }

  const specializations = Array.isArray(profile.specializations) ? profile.specializations : [];

  return {
    name: profile.user.name || '',
    email: profile.user.email || '',
    phone: profile.user.phone || '',
    role: profile.user.role || authenticatedRole,
    bio: profile.bio || '',
    area: profile.area || '',
    city: profile.city || '',
    serviceAreas: Array.isArray(profile.service_areas) ? profile.service_areas : [],
    specializations,
    specialization: specializations[0] || '',
    verificationStatus: profile.verification_status || 'pending',
    verifiedAt: profile.verified_at || null,
    isAvailable: Boolean(profile.is_available),
    dailyCapacity: profile.daily_capacity,
  };
}

export function profileToApi(profile) {
  return {
    name: profile.name.trim(),
    email: profile.email.trim() || null,
    bio: profile.bio.trim() || null,
    area: profile.area.trim(),
    city: profile.city.trim(),
    service_areas: profile.serviceAreas,
    specializations: profile.specialization === (profile.specializations[0] || '')
      ? profile.specializations
      : profile.specialization ? [profile.specialization] : [],
  };
}
