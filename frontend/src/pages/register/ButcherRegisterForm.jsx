import { useState } from 'react';
import { Link } from 'react-router-dom';
import FormField from '../../components/form/FormField';
import { validatePhone } from '../../utils/validation';

const initialState = {
  fullName: '',
  phone: '',
  agree: false,
};

export default function ButcherRegisterForm({ onComplete, showLogin = true }) {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [stage, setStage] = useState('fill');
  const [devPin, setDevPin] = useState('');
  const [pinExpiresAt, setPinExpiresAt] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const isDev = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE !== 'production';

  const validate = () => {
    const nextErrors = {};
    if (!form.fullName.trim()) nextErrors.fullName = 'Full name is required.';
    if (!form.phone.trim()) {
      nextErrors.phone = 'Phone number is required.';
    } else if (!validatePhone(form.phone)) {
      nextErrors.phone = 'Please enter a valid phone number.';
    }
    if (!form.agree) nextErrors.agree = 'You must agree to the terms and conditions.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;
    setErrorMsg('');
    setIsSubmitting(true);
    const pin = String(Math.floor(1000 + Math.random() * 9000));
    const expires = Date.now() + 5 * 60 * 1000;
    setTimeout(() => setIsSubmitting(false), 400);
    setDevPin(pin);
    setPinExpiresAt(expires);
    setAttempts(0);
    setStage('verify');
    if (isDev) {
      // eslint-disable-next-line no-console
      console.log('[DEV PIN] Butcher registration PIN for', form.phone, ':', pin);
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
      setSubmitted(true);
      setStage('done');
      if (onComplete) onComplete();
      if (isDev) {
        // eslint-disable-next-line no-console
        console.log('Butcher registration data (dev):', form);
      }
      return;
    }
    setAttempts((a) => a + 1);
    setErrorMsg('Incorrect PIN. Please try again.');
  };

  const resendPin = () => {
    const pin = String(Math.floor(1000 + Math.random() * 9000));
    const expires = Date.now() + 5 * 60 * 1000;
    setDevPin(pin);
    setPinExpiresAt(expires);
    setAttempts(0);
    setPinInput('');
    setErrorMsg('');
    if (isDev) {
      // eslint-disable-next-line no-console
      console.log('[DEV PIN] Resent butcher registration PIN for', form.phone, ':', pin);
    }
  };

  return (
    <>
      {submitted ? (
        <div className="rounded-3xl border border-warm-cream bg-warm-cream p-8 text-primary">
          <h2 className="text-2xl font-semibold">Registration submitted</h2>
          <p className="mt-3 text-slate-700">Your butcher application has been received. It will be reviewed before activation.</p>
        </div>
      ) : stage === 'fill' ? (
        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-6 lg:grid-cols-2">
            <FormField label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} error={errors.fullName} placeholder="Enter your full name" required />
            <FormField label="Phone Number" name="phone" value={form.phone} onChange={handleChange} error={errors.phone} placeholder="01XXXXXXXXX" required />
          </div>

          <label className="flex items-start gap-3 text-sm text-slate-700">
            <input type="checkbox" name="agree" checked={form.agree} onChange={handleChange} className="mt-1 h-5 w-5 rounded border-slate-300 text-primary focus:ring-warm-cream" />
            <span>
              I agree to the <Link to="/terms" className="font-semibold text-primary hover:text-primary-dark">Terms & Conditions</Link>.
              {errors.agree && <span className="block text-rose-600">{errors.agree}</span>}
            </span>
          </label>

          <button type="submit" disabled={isSubmitting} className="inline-flex w-full items-center justify-center rounded-3xl bg-primary px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-primary transition duration-200 hover:-translate-y-0.5 hover:bg-primary-dark active:translate-y-1 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600">
            {isSubmitting ? 'Sending...' : 'Register & Send PIN'}
          </button>

          {showLogin && (
            <p className="text-center text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/login/butcher" className="font-semibold text-primary hover:text-primary-dark">
                Log In
              </Link>
            </p>
          )}
        </form>
      ) : stage === 'verify' ? (
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

            <div className="flex items-center justify-between gap-4">
              <button type="submit" className="inline-flex items-center justify-center rounded-3xl bg-primary px-6 py-3 text-sm font-semibold text-white">Verify PIN</button>
              <button type="button" onClick={resendPin} className="text-sm font-semibold text-primary">Resend PIN</button>
            </div>

            <p className="text-xs text-slate-500">Attempts: {attempts} / 3</p>
            {pinExpiresAt && <p className="text-xs text-slate-500">Expires: {new Date(pinExpiresAt).toLocaleTimeString()}</p>}
          </div>
        </form>
      ) : null}
    </>
  );
}
