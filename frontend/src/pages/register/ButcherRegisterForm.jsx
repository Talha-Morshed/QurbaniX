import { useState } from 'react';
import { Link } from 'react-router-dom';
import FormField from '../../components/form/FormField';
import { validatePhone } from '../../utils/validation';
import { BANGLADESH_DISTRICTS } from '../../constants/locations';

const initialState = {
  fullName: '',
  shopName: '',
  nationalId: '',
  phone: '',
  address: '',
  experience: '',
  serviceArea: '',
};

export default function ButcherRegisterForm() {
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
    if (!form.nationalId.trim()) nextErrors.nationalId = 'National ID is required.';
    if (!form.phone.trim()) {
      nextErrors.phone = 'Phone number is required.';
    } else if (!validatePhone(form.phone)) {
      nextErrors.phone = 'Please enter a valid phone number.';
    }
    if (!form.address.trim()) nextErrors.address = 'Address is required.';
    if (!form.experience.trim()) nextErrors.experience = 'Years of experience is required.';
    if (!form.serviceArea.trim()) nextErrors.serviceArea = 'Service area is required.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
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
        <div className="rounded-3xl border border-[#f4d4e2] bg-[#fff4f8] p-8 text-[#9b1455]">
          <h2 className="text-2xl font-semibold">Registration submitted</h2>
          <p className="mt-3 text-slate-700">Your butcher application has been received. It will be reviewed before activation.</p>
        </div>
      ) : stage === 'fill' ? (
        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-6 lg:grid-cols-2">
            <FormField label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} error={errors.fullName} placeholder="Enter your full name" required />
            <FormField label="Business/Shop Name" name="shopName" value={form.shopName} onChange={handleChange} placeholder="Optional" />
            <FormField label="National ID Number" name="nationalId" value={form.nationalId} onChange={handleChange} error={errors.nationalId} placeholder="Enter your national ID" required />
            <FormField label="Phone Number" name="phone" value={form.phone} onChange={handleChange} error={errors.phone} placeholder="01XXXXXXXXX" required />
            <FormField label="Address" name="address" value={form.address} onChange={handleChange} error={errors.address} placeholder="Enter your address" required suggestions={BANGLADESH_DISTRICTS} />
            <FormField label="Years of Experience" name="experience" value={form.experience} onChange={handleChange} error={errors.experience} placeholder="e.g. 5" required />
            <FormField label="Service Area" name="serviceArea" value={form.serviceArea} onChange={handleChange} error={errors.serviceArea} placeholder="Enter your service area" required suggestions={BANGLADESH_DISTRICTS} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">Upload placeholders</p>
              <p className="mt-3">Upload National ID and Profile Photo when the backend is ready. These are placeholders for now.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">Verification notice</p>
              <p className="mt-3">Your registration will be reviewed by administrators before your butcher account becomes active.</p>
            </div>
          </div>

          <button type="submit" className="inline-flex w-full items-center justify-center rounded-3xl bg-[#9b1455] px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-[#9b1455]/20 transition duration-200 hover:-translate-y-0.5 hover:bg-[#7a0f40] active:translate-y-1">
            {isSubmitting ? 'Sending...' : 'Register & Send PIN'}
          </button>

          <p className="text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login/butcher" className="font-semibold text-[#9b1455] hover:text-[#7a0f40]">
              Log In
            </Link>
          </p>
        </form>
      ) : stage === 'verify' ? (
        <form className="space-y-6" onSubmit={verifyPin} noValidate>
          <div className="space-y-5">
            <p className="text-sm text-slate-700">A 4-digit PIN was sent to <strong className="text-slate-900">{form.phone}</strong>.</p>
            <label className="block space-y-2 text-sm font-medium text-slate-700">
              <span>Enter PIN</span>
              <input
                className={`w-full rounded-3xl border px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition duration-200 focus:border-[#9b1455] focus:ring-2 focus:ring-[#f8dbe7] ${errorMsg ? 'border-rose-500' : 'border-slate-200'}`}
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
              <button type="submit" className="inline-flex items-center justify-center rounded-3xl bg-[#9b1455] px-6 py-3 text-sm font-semibold text-white">Verify PIN</button>
              <button type="button" onClick={resendPin} className="text-sm font-semibold text-[#9b1455]">Resend PIN</button>
            </div>

            <p className="text-xs text-slate-500">Attempts: {attempts} / 3</p>
            {pinExpiresAt && <p className="text-xs text-slate-500">Expires: {new Date(pinExpiresAt).toLocaleTimeString()}</p>}
          </div>
        </form>
      ) : null}
    </>
  );
}
