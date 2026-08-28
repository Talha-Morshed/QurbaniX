import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoginShell from '../../components/form/LoginShell';
import { maskPhone, validatePhone } from '../../utils/validation';
import { api, setToken } from '../../api';

function RoleLogin({ role, dashboardPath }) {
  const [form, setForm] = useState({ phone: '' });
  const [errors, setErrors] = useState({});
  const [stage, setStage] = useState('request');
  const [devPin, setDevPin] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const validatePhoneOnly = () => {
    const nextErrors = {};
    const phone = form.phone.trim();

    if (!phone) nextErrors.phone = 'Phone number is required.';
    else if (!validatePhone(phone)) nextErrors.phone = 'Please enter a valid phone number.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const sendPin = async (event) => {
    event.preventDefault();
    if (!validatePhoneOnly()) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const data = await api.login(form.phone.trim());
      setDevPin(data.dev_pin || '');
      setStage('verify');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send PIN. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyPin = async (event) => {
    event.preventDefault();
    setErrorMsg('');

    if (!pinInput.trim()) {
      setErrorMsg('Please enter the PIN.');
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await api.loginVerify(form.phone.trim(), pinInput.trim());
      setToken(data.token);
      navigate(dashboardPath, { replace: true });
    } catch (err) {
      setErrorMsg(err.message || 'Incorrect PIN. Please try again.');
    } finally {
      setIsSubmitting(false);
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
          {errorMsg && (
            <div className="rounded border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert">
              {errorMsg}
            </div>
          )}
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

          <button type="submit" disabled={isSubmitting} className="premium-action inline-flex min-w-40 items-center justify-center rounded-3xl bg-primary px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-primary hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600">
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
            <p className="text-sm text-slate-700">A 4-digit PIN was sent to <strong className="text-slate-900">{maskPhone(form.phone)}</strong>.</p>

            {devPin && (
              <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                <strong>Dev PIN:</strong> {devPin}
              </div>
            )}

            {errorMsg && (
              <div className="rounded border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert">
                {errorMsg}
              </div>
            )}

            <label className="block space-y-2 text-sm font-medium text-slate-700">
              <span>Enter PIN</span>
              <input
                className="w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition duration-200 focus:border-primary focus:ring-2 focus:ring-warm-cream"
                type="text"
                name="pin"
                value={pinInput}
                onChange={(event) => setPinInput(event.target.value)}
                placeholder="1234"
              />
            </label>

            <div className="flex items-center justify-between gap-4">
              <button type="submit" disabled={isSubmitting} className="premium-action inline-flex items-center justify-center rounded-3xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-slate-300">
                {isSubmitting ? 'Verifying...' : 'Verify'}
              </button>
              <button type="button" onClick={sendPin} className="premium-action inline-flex min-w-28 items-center justify-center px-3 py-2 text-sm font-semibold text-primary">Resend PIN</button>
            </div>
          </div>
        </form>
      )}
    </LoginShell>
  );
}

export default RoleLogin;
