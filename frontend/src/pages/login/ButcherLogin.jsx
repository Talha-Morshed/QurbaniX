import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoginShell from '../../components/form/LoginShell';
import { validatePhone } from '../../utils/validation';

function ButcherLogin() {
  const [form, setForm] = useState({ phone: '' });
  const [errors, setErrors] = useState({});
  const [stage, setStage] = useState('request'); // 'request' | 'verify'
  const [devPin, setDevPin] = useState('');
  const [pinExpiresAt, setPinExpiresAt] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const isDev = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE !== 'production';

  const validatePhoneOnly = () => {
    const nextErrors = {};
    const phone = (form.phone || '').trim();

    if (!phone) {
      nextErrors.phone = 'Phone number is required.';
    } else if (!validatePhone(phone)) {
      nextErrors.phone = 'Please enter a valid phone number.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const generatePin = () => String(Math.floor(1000 + Math.random() * 9000));

  const sendPin = (event) => {
    event.preventDefault();
    setErrorMsg('');
    if (!validatePhoneOnly()) return;

    setIsSubmitting(true);
    const pin = generatePin();
    const expires = Date.now() + 5 * 60 * 1000; // 5 minutes
    setTimeout(() => setIsSubmitting(false), 400);
    setDevPin(pin);
    setPinExpiresAt(expires);
    setAttempts(0);
    setStage('verify');

    if (isDev) {
      // show in console only for development/testing
      // eslint-disable-next-line no-console
      console.log('[DEV PIN] Butcher login PIN for', form.phone, ':', pin);
    }
  };

  const verifyPin = (event) => {
    event.preventDefault();
    setErrorMsg('');

    if (!pinExpiresAt || Date.now() > pinExpiresAt) {
      setErrorMsg('The PIN has expired. Please resend.');
      return;
    }

    if (attempts >= 3) {
      setErrorMsg('Too many failed attempts. Please resend PIN.');
      return;
    }

    if (pinInput.trim() === devPin) {
      navigate('/dashboard/butcher', { replace: true });
      return;
    }

    setAttempts((a) => a + 1);
    setErrorMsg('Incorrect PIN. Please try again.');
  };

  const resendPin = () => {
    const pin = generatePin();
    const expires = Date.now() + 5 * 60 * 1000;
    setDevPin(pin);
    setPinExpiresAt(expires);
    setAttempts(0);
    setPinInput('');
    setErrorMsg('');
    if (isDev) {
      // eslint-disable-next-line no-console
      console.log('[DEV PIN] Resent butcher PIN for', form.phone, ':', pin);
    }
  };

  return (
    <LoginShell
      pageTitle="Butcher Login"
      pageDescription="Access your butcher account."
      notice="Manage your order requests and business profile from one secure hub."
      leftTitle="Welcome back, butcher"
      leftDescription="Sign in to manage your availability, accept bookings, and keep your Qurbani business running smoothly."
      formTitle="Butcher Sign In"
      formSubtitle="Sign in with your phone number to continue."
    >
      {stage === 'request' && (
        <form className="space-y-6" onSubmit={sendPin} noValidate>
          <div className="space-y-5">
            <label className="block space-y-2 text-sm font-medium text-slate-700">
              <span className="flex items-center gap-2">Phone Number</span>
              <input
                className={`w-full rounded-3xl border px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition duration-200 focus:border-primary focus:ring-2 focus:ring-warm-cream ${errors.phone ? 'border-rose-500' : 'border-slate-200'}`}
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="01XXXXXXXXX"
                aria-invalid={!!errors.phone}
              />
              {errors.phone && <p className="text-xs text-rose-600">{errors.phone}</p>}
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center rounded-3xl bg-primary px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-primary transition duration-200 hover:-translate-y-0.5 hover:bg-primary-dark active:translate-y-1 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
          >
            {isSubmitting ? 'Sending...' : 'Send PIN'}
          </button>

          <p className="text-center text-sm text-slate-600">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold text-primary transition hover:text-primary-dark">
              Register
            </Link>
          </p>
        </form>
      )}

      {stage === 'verify' && (
        <form className="space-y-6" onSubmit={verifyPin} noValidate>
          <div className="space-y-5">
            <p className="text-sm text-slate-700">A 4-digit PIN was sent to <strong className="text-slate-900">{form.phone}</strong>.</p>
            <label className="block space-y-2 text-sm font-medium text-slate-700">
              <span>Enter PIN</span>
              <input
                className={`w-full rounded-3xl border px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition duration-200 focus:border-primary focus:ring-2 focus:ring-warm-cream ${errorMsg ? 'border-rose-500' : 'border-slate-200'}`}
                type="text"
                name="pin"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="1234"
                aria-invalid={!!errorMsg}
              />
              {errorMsg && <p className="text-xs text-rose-600">{errorMsg}</p>}
            </label>

            {/* Dev PIN is logged to console in dev mode; not shown on-screen */}

            <div className="flex items-center justify-between gap-4">
              <button type="submit" className="inline-flex items-center justify-center rounded-3xl bg-primary px-6 py-3 text-sm font-semibold text-white">Verify PIN</button>
              <button type="button" onClick={resendPin} className="text-sm font-semibold text-primary">Resend PIN</button>
            </div>

            <p className="text-xs text-slate-500">Attempts: {attempts} / 3</p>
            {pinExpiresAt && <p className="text-xs text-slate-500">Expires: {new Date(pinExpiresAt).toLocaleTimeString()}</p>}
          </div>
        </form>
      )}
    </LoginShell>
  );
}

export default ButcherLogin;
