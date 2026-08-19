import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoginShell from '../../components/form/LoginShell';
import { validatePhone } from '../../utils/validation';

function RoleLogin({ role, dashboardPath }) {
  const [form, setForm] = useState({ phone: '' });
  const [errors, setErrors] = useState({});
  const [stage, setStage] = useState('request');
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
    const phone = form.phone.trim();

    if (!phone) nextErrors.phone = 'Phone number is required.';
    else if (!validatePhone(phone)) nextErrors.phone = 'Please enter a valid phone number.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const generatePin = () => String(Math.floor(1000 + Math.random() * 9000));

  const issuePin = (isResend = false) => {
    const pin = generatePin();
    setDevPin(pin);
    setPinExpiresAt(Date.now() + 5 * 60 * 1000);
    setAttempts(0);
    setPinInput('');
    setErrorMsg('');

    if (isDev) {
      // eslint-disable-next-line no-console
      const roleLabel = isResend ? role.toLowerCase() : role;
      console.log(`[DEV PIN] ${isResend ? 'Resent ' : ''}${roleLabel} ${isResend ? '' : 'login '}PIN for`, form.phone, ':', pin);
    }
  };

  const sendPin = (event) => {
    event.preventDefault();
    if (!validatePhoneOnly()) return;

    setIsSubmitting(true);
    window.setTimeout(() => setIsSubmitting(false), 400);
    issuePin();
    setStage('verify');
  };

  const verifyPin = (event) => {
    event.preventDefault();
    setErrorMsg('');

    if (!pinExpiresAt || Date.now() > pinExpiresAt) {
      setErrorMsg('The PIN has expired. Please resend.');
    } else if (attempts >= 3) {
      setErrorMsg('Too many failed attempts. Please resend PIN.');
    } else if (pinInput.trim() === devPin) {
      navigate(dashboardPath, { replace: true });
    } else {
      setAttempts((current) => current + 1);
      setErrorMsg('Incorrect PIN. Please try again.');
    }
  };

  return (
    <LoginShell
      pageTitle="Secure Sign In"
      pageDescription="Sign in to your account."
      notice="Secure sign-in for trusted and verified Qurbani services."
      leftTitle="Welcome back to QurbaniX"
      leftDescription="Sign in securely to manage your Qurbani bookings and services in one place."
      formTitle="Sign in to your account"
      formSubtitle="Continue with your registered phone number."
      splitLayout
      compact
    >
      {stage === 'request' ? (
        <form className="space-y-6" onSubmit={sendPin} noValidate>
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            <span className="flex items-center gap-2">Phone Number</span>
            <input
              className={`w-full rounded-3xl border px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition duration-200 focus:border-primary focus:ring-2 focus:ring-warm-cream ${errors.phone ? 'border-rose-500' : 'border-slate-200'}`}
              type="text"
              name="phone"
              value={form.phone}
              onChange={(event) => setForm({ phone: event.target.value })}
              placeholder="01XXXXXXXXX"
              aria-invalid={!!errors.phone}
            />
            {errors.phone && <p className="text-xs text-rose-600">{errors.phone}</p>}
          </label>

          <button type="submit" disabled={isSubmitting} className="inline-flex w-full items-center justify-center rounded-3xl bg-primary px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-primary transition duration-200 hover:-translate-y-0.5 hover:bg-primary-dark active:translate-y-1 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600">
            {isSubmitting ? 'Sending...' : 'Send PIN'}
          </button>

          <p className="text-center text-sm text-slate-600">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold text-primary transition hover:text-primary-dark">Register</Link>
          </p>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={verifyPin} noValidate>
          <div className="space-y-3">
            <p className="text-sm text-slate-700">A 4-digit PIN was sent to <strong className="text-slate-900">{form.phone}</strong>.</p>
            <label className="block space-y-2 text-sm font-medium text-slate-700">
              <span>Enter PIN</span>
              <input
                className={`w-full rounded-3xl border px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition duration-200 focus:border-primary focus:ring-2 focus:ring-warm-cream ${errorMsg ? 'border-rose-500' : 'border-slate-200'}`}
                type="text"
                name="pin"
                value={pinInput}
                onChange={(event) => setPinInput(event.target.value)}
                placeholder="1234"
                aria-invalid={!!errorMsg}
              />
              <p className="min-h-5 text-xs text-rose-600">{errorMsg}</p>
            </label>

            <div className="flex items-center justify-between gap-4">
              <button type="submit" className="inline-flex items-center justify-center rounded-3xl bg-primary px-6 py-3 text-sm font-semibold text-white">Verify PIN</button>
              <button type="button" onClick={() => issuePin(true)} className="text-xs font-semibold text-primary">Resend PIN</button>
            </div>
          </div>
        </form>
      )}
    </LoginShell>
  );
}

export default RoleLogin;
