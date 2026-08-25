/* ===========================================================
   RegistrationLanding.jsx - Redesigned unified registration page
   ===========================================================
   CHANGES MADE:
   - Removed the internal split-layout since PageShell now provides
     the split layout with animal images on the right panel
   - Content is now a focused single-column form area inside PageShell
   - Customer role card uses customer-icon (Image 1: person silhouette)
   - Butcher role card uses butcher-icon (Image 2: crossed cleavers)
   - Improved step progress indicator styling
   - Preserved all existing state management, step flow, and form logic
   - Preserved sign-in link navigation
   ============================================================ */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import LoginShell from '../../components/form/LoginShell';
import CustomerRegisterForm from './CustomerRegisterForm';
import ButcherRegisterForm from './ButcherRegisterForm';
import images from '../../assets/images';

export default function RegistrationLanding() {
  const [role, setRole] = useState('customer');

  return (
    <LoginShell
      pageTitle="Register"
      pageDescription="Create your account."
      leftTitle="Join QurbaniX"
      leftDescription="Create your account to manage Qurbani bookings and services in one place."
      formTitle={`${role === 'customer' ? 'Customer' : 'Butcher'} registration`}
      formSubtitle="Choose an account type, then enter your details."
      splitLayout
      compact
      formHeightClass="lg:h-[380px]"
      alignFormTop
      sideImage={images.registration}
    >
      <div className="mb-2 grid grid-cols-2 gap-3">
        <button type="button" onClick={() => setRole('customer')} className={`flex h-10 items-center justify-center gap-2 border px-3 text-sm font-semibold ${role === 'customer' ? 'border-primary bg-primary text-white' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'} focus:outline-none focus:ring-2 focus:ring-warm-cream`}>
          <img src={images.customerIcon} alt="" className="h-7 w-7 object-contain" />
          Customer
        </button>
        <button type="button" onClick={() => setRole('butcher')} className={`flex h-10 items-center justify-center gap-2 border px-3 text-sm font-semibold ${role === 'butcher' ? 'border-primary bg-primary text-white' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'} focus:outline-none focus:ring-2 focus:ring-warm-cream`}>
          <img src={images.butcherIcon} alt="" className="h-7 w-7 object-contain" />
          Butcher
        </button>
      </div>

      {role === 'customer' ? <CustomerRegisterForm showLogin={false} compact /> : <ButcherRegisterForm showLogin={false} compact />}

      <p className="mt-2 text-center text-sm text-slate-600">
        Already have an account? <Link to="/login/customer" className="font-semibold text-primary transition hover:text-primary-dark">Sign in</Link>
      </p>
    </LoginShell>
  );
}
