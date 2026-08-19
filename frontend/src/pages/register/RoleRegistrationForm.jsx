import { useState } from 'react';
import { Link } from 'react-router-dom';
import FormField from '../../components/form/FormField';
import { maskPhone, validatePhone } from '../../utils/validation';

const initialState = { fullName: '', phone: '', agree: false };

function RoleRegistrationForm({ role, loginPath, onComplete, showLogin = true, successTitle, successMessage }) {
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
    if (!form.phone.trim()) nextErrors.phone = 'Phone number is required.';
    else if (!validatePhone(form.phone)) nextErrors.phone = 'Please enter a valid phone number.';
    if (!form.agree) nextErrors.agree = 'You must agree to the terms and conditions.';
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
      console.log(`[DEV PIN] ${isResend ? 'Resent ' : ''}${roleLabel} registration PIN for`, form.phone, ':', pin);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;
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
      setSubmitted(true);
      setStage('done');
      onComplete?.();
      if (isDev) {
        // eslint-disable-next-line no-console
        console.log(`${role} registration data (dev):`, form);
      }
    } else {
      setAttempts((current) => current + 1);
      setErrorMsg('Incorrect PIN. Please try again.');
    }
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  if (submitted) {
    return <div className="rounded-3xl border border-warm-cream bg-warm-cream p-8 text-primary"><h2 className="text-2xl font-semibold">{successTitle}</h2><p className="mt-3 text-slate-700">{successMessage}</p></div>;
  }

  if (stage === 'verify') {
    return (
      <form className="space-y-6" onSubmit={verifyPin} noValidate>
        <div className="space-y-5">
          <p className="text-sm text-slate-700">A 4-digit PIN was sent to <strong className="text-slate-900">{maskPhone(form.phone)}</strong>.</p>
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            <span>Enter PIN</span>
            <input className={`w-full rounded-3xl border px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition duration-200 focus:border-primary focus:ring-2 focus:ring-warm-cream ${errorMsg ? 'border-rose-500' : 'border-slate-200'}`} type="text" name="pin" value={pinInput} onChange={(event) => setPinInput(event.target.value)} placeholder="1234" aria-invalid={!!errorMsg} />
            {errorMsg && <p className="text-xs text-rose-600">{errorMsg}</p>}
          </label>
          <div className="flex items-center justify-between gap-4">
            <button type="submit" className="premium-action inline-flex items-center justify-center rounded-3xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary hover:bg-primary-dark">Enter</button>
            <button type="button" onClick={() => issuePin(true)} className="premium-action text-[0.35rem] font-semibold text-primary">Resend PIN</button>
          </div>
          <p className="text-xs text-slate-500">Attempts: {attempts} / 3</p>
          {pinExpiresAt && <p className="text-xs text-slate-500">Expires: {new Date(pinExpiresAt).toLocaleTimeString()}</p>}
        </div>
      </form>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      <div className="grid gap-6 lg:grid-cols-2">
        <FormField label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} error={errors.fullName} placeholder="Enter your full name" required />
        <FormField label="Phone Number" name="phone" value={form.phone} onChange={handleChange} error={errors.phone} placeholder="01XXXXXXXXX" required />
      </div>
      <label className="flex items-start gap-3 text-sm text-slate-700">
        <input type="checkbox" name="agree" checked={form.agree} onChange={handleChange} className="mt-1 h-5 w-5 rounded border-slate-300 text-primary focus:ring-warm-cream" />
        <span>I agree to the <Link to="/terms" className="font-semibold text-primary hover:text-primary-dark">Terms & Conditions</Link>.{errors.agree && <span className="block text-rose-600">{errors.agree}</span>}</span>
      </label>
      <button type="submit" disabled={isSubmitting} className="premium-action inline-flex w-full items-center justify-center rounded-3xl bg-primary px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-primary hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600">{isSubmitting ? 'Sending...' : 'Register & Send PIN'}</button>
      {showLogin && <p className="text-center text-sm text-slate-600">Already have an account?{' '}<Link to={loginPath} className="font-semibold text-primary hover:text-primary-dark">Log In</Link></p>}
    </form>
  );
}

export default RoleRegistrationForm;
