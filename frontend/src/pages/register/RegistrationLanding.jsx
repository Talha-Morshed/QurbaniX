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
import PageShell from '../../components/form/PageShell';
import CustomerRegisterForm from './CustomerRegisterForm';
import ButcherRegisterForm from './ButcherRegisterForm';
import images from '../../assets/images';

export default function RegistrationLanding() {
  const [role, setRole] = useState(null);
  const [completed, setCompleted] = useState(false);
  const activeStep = !role ? 1 : completed ? 3 : 2;

  return (
    <PageShell title="Register" description="Create your account." hideHomeButton hideLogo>
      {/* Form header card with role context */}
        <div className="mb-3">
        <div className="w-full border border-slate-100 bg-transparent px-4 py-4">
          <div className="flex flex-col">
            <h3 className="text-lg md:text-2xl font-semibold text-slate-900">
              {role === 'customer' ? 'Customer Registration' : role === 'butcher' ? 'Butcher Registration' : 'Select role'}
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              {role ? 'Complete the form and verify your phone number.' : 'Pick an account type to continue.'}
            </p>
          </div>
        </div>
      </div>

      {/* Step progress indicator */}
      <div className="mb-4">
        <div className="flex items-center gap-3 text-xs text-slate-500 sm:gap-4">
          <div className={`flex items-center gap-2 ${activeStep === 1 ? 'text-emerald-700 font-semibold' : ''}`}>
            <div className={`keep-circular w-7 h-7 rounded-full flex items-center justify-center ${activeStep === 1 ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'}`}>1</div>
            <div className="hidden sm:inline">Choose role</div>
          </div>
          <div className="h-px flex-1 bg-slate-100" />
          <div className={`flex items-center gap-2 ${activeStep === 2 ? 'text-emerald-700 font-semibold' : ''}`}>
            <div className={`keep-circular w-7 h-7 rounded-full flex items-center justify-center ${activeStep === 2 ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'}`}>2</div>
            <div className="hidden sm:inline">Account details</div>
          </div>
          <div className="h-px flex-1 bg-slate-100" />
          <div className={`flex items-center gap-2 ${activeStep === 3 ? 'text-emerald-700 font-semibold' : ''}`}>
            <div className={`keep-circular w-7 h-7 rounded-full flex items-center justify-center ${activeStep === 3 ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'}`}>3</div>
            <div className="hidden sm:inline">Complete</div>
          </div>
        </div>
      </div>

      {/* Role selection cards with role-specific icons */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        {/* Customer role card - uses customer-icon (person silhouette) */}
        <button
          type="button"
          onClick={() => { setRole('customer'); setCompleted(false); }}
          className={`flex items-center justify-center gap-3 px-4 py-3 text-sm font-semibold ${
            role === 'customer' ? 'bg-emerald-700 text-white shadow-md' : 'bg-slate-50 text-slate-700 border border-slate-100 hover:bg-slate-100'
          } focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-colors duration-200`}
        >
          <div className="h-8 w-8 flex-shrink-0 flex items-center justify-center">
            <img src={images.customerIcon} alt="" className="h-full w-full object-contain" />
          </div>
          Customer
        </button>

        {/* Butcher role card - uses butcher-icon (crossed cleavers with cow) */}
        <button
          type="button"
          onClick={() => { setRole('butcher'); setCompleted(false); }}
          className={`flex items-center justify-center gap-3 px-4 py-3 text-sm font-semibold ${
            role === 'butcher' ? 'bg-emerald-700 text-white shadow-md' : 'bg-slate-50 text-slate-700 border border-slate-100 hover:bg-slate-100'
          } focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-colors duration-200`}
        >
          <div className="h-8 w-8 flex-shrink-0 flex items-center justify-center">
            <img src={images.butcherIcon} alt="" className="h-full w-full object-contain" />
          </div>
          Butcher
        </button>
      </div>

      <div>
        {role === 'customer' && <CustomerRegisterForm onComplete={() => setCompleted(true)} showLogin={false} />}
        {role === 'butcher' && <ButcherRegisterForm onComplete={() => setCompleted(true)} showLogin={false} />}
        {!role && (
          <div className="border border-slate-100 bg-slate-50 p-6 text-sm text-slate-600">
            Select a role above to begin registration.
          </div>
        )}
      </div>

      <p className="mt-4 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/login/customer" className="font-semibold text-primary transition hover:text-primary-dark">
          Sign in
        </Link>
      </p>
    </PageShell>
  );
}
