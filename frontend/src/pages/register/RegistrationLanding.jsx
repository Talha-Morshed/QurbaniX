import { useState } from 'react';
import { Link } from 'react-router-dom';
import LoginShell from '../../components/form/LoginShell';
import CustomerRegisterForm from './CustomerRegisterForm';
import ButcherRegisterForm from './ButcherRegisterForm';
import images from '../../assets/images';

export default function RegistrationLanding() {
  const [role, setRole] = useState('customer');
  const [pinRequested, setPinRequested] = useState(false);
  const [roleSelectionError, setRoleSelectionError] = useState('');

  const selectRole = (nextRole) => {
    if (pinRequested) {
      setRoleSelectionError('You cannot switch roles while verifying your PIN.');
      return;
    }
    setRole(nextRole);
    setPinRequested(false);
    setRoleSelectionError('');
  };

  return (
    <LoginShell
      pageTitle="Register"
      pageDescription="Create your account."
      notice="Create a secure account for trusted and verified Qurbani services."
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
        <button type="button" onClick={() => selectRole('customer')} aria-disabled={pinRequested} aria-pressed={role === 'customer'} className={`flex h-10 items-center justify-center gap-2 border px-3 text-sm font-semibold ${role === 'customer' ? 'border-primary bg-primary text-white' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'} focus:outline-none focus:ring-2 focus:ring-warm-cream ${pinRequested ? 'cursor-not-allowed opacity-60' : ''}`}>
          <span className="keep-circular flex h-4 w-4 items-center justify-center border-2 border-current" aria-hidden="true">
            {role === 'customer' && <span className="keep-circular h-2 w-2 bg-current" />}
          </span>
          Customer
        </button>
        <button type="button" onClick={() => selectRole('butcher')} aria-disabled={pinRequested} aria-pressed={role === 'butcher'} className={`flex h-10 items-center justify-center gap-2 border px-3 text-sm font-semibold ${role === 'butcher' ? 'border-primary bg-primary text-white' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'} focus:outline-none focus:ring-2 focus:ring-warm-cream ${pinRequested ? 'cursor-not-allowed opacity-60' : ''}`}>
          <span className="keep-circular flex h-4 w-4 items-center justify-center border-2 border-current" aria-hidden="true">
            {role === 'butcher' && <span className="keep-circular h-2 w-2 bg-current" />}
          </span>
          Butcher
        </button>
      </div>

      {roleSelectionError && <p className="mb-2 text-xs font-medium text-rose-600" role="alert">{roleSelectionError}</p>}

      {role === 'customer' ? <CustomerRegisterForm showLogin={false} compact onPinRequested={() => setPinRequested(true)} /> : <ButcherRegisterForm showLogin={false} compact onPinRequested={() => setPinRequested(true)} />}

      <p className="mt-2 text-center text-sm text-slate-600">
        Already have an account? <Link to={`/login/${role}`} className="font-semibold text-primary transition hover:text-primary-dark">Sign in</Link>
      </p>
    </LoginShell>
  );
}
