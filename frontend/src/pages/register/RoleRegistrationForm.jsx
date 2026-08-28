import { useState } from 'react';
import { Link } from 'react-router-dom';
import FormField from '../../components/form/FormField';
import { validatePhone } from '../../utils/validation';
import { api, setToken } from '../../api';

const initialState = { fullName: '', phone: '', agree: false };

function RoleRegistrationForm({ role, loginPath, onComplete, onPinRequested, showLogin = true, successTitle, successMessage, compact = false }) {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const validate = () => {
    const nextErrors = {};
    if (!form.fullName.trim()) nextErrors.fullName = 'Full name is required.';
    if (!form.phone.trim()) nextErrors.phone = 'Phone number is required.';
    else if (!validatePhone(form.phone)) nextErrors.phone = 'Please enter a valid phone number.';
    if (!form.agree) nextErrors.agree = 'You must agree to the terms and conditions.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const data = await api.register({
        name: form.fullName.trim(),
        phone: form.phone.trim(),
        role: role.toLowerCase(),
      });

      setToken(data.token);
      setSubmitted(true);
      onComplete?.();
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  if (submitted) {
    return (
      <div className="border border-warm-cream bg-warm-cream p-8 text-primary">
        <h2 className="text-2xl font-semibold">{successTitle}</h2>
        <p className="mt-3 text-slate-700">{successMessage}</p>
      </div>
    );
  }

  return (
    <form className={compact ? 'space-y-2' : 'space-y-6'} onSubmit={handleSubmit} noValidate>
      {errorMsg && (
        <div className="rounded border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert">
          {errorMsg}
        </div>
      )}
      <div className={`grid ${compact ? 'gap-3' : 'gap-6'} lg:grid-cols-2`}>
        <FormField label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} error={errors.fullName} placeholder="Enter your full name" required />
        <FormField label="Phone Number" name="phone" value={form.phone} onChange={handleChange} error={errors.phone} placeholder="01XXXXXXXXX" required />
      </div>
      <label className="flex items-start gap-3 text-sm text-slate-700">
        <input type="checkbox" name="agree" checked={form.agree} onChange={handleChange} className="mt-1 h-5 w-5 rounded border-slate-300 text-primary focus:ring-warm-cream" />
        <span>I agree to the <Link to="/terms" className="font-semibold text-primary hover:text-primary-dark">Terms & Conditions</Link>.<span className="block min-h-5 text-rose-600" role="alert" aria-live="polite">{errors.agree}</span></span>
      </label>
      <button type="submit" disabled={isSubmitting} className={`premium-action inline-flex min-w-52 items-center justify-center rounded-3xl bg-primary px-8 text-sm font-semibold text-white shadow-lg shadow-primary hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 ${compact ? 'py-3' : 'py-4'}`}>{isSubmitting ? 'Registering...' : 'Register'}</button>
    </form>
  );
}

export default RoleRegistrationForm;
