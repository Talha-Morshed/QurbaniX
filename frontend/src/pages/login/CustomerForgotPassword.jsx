import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageShell from '../../components/form/PageShell';
import { validateEmail, validatePhone } from '../../utils/validation';

function CustomerForgotPassword() {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      setError('Email address or phone number is required.');
      return false;
    }

    if (trimmedValue.includes('@')) {
      if (!validateEmail(trimmedValue)) {
        setError('Please enter a valid email address.');
        return false;
      }
    } else if (!validatePhone(trimmedValue)) {
      setError('Please enter a valid phone number.');
      return false;
    }

    setError('');
    return true;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    window.setTimeout(() => {
      setIsSubmitting(false);
      navigate('/reset-password/customer');
    }, 800);
  };

  return (
    <PageShell title="Customer Forgot Password" description="Recover your customer account." notice="We will guide you through the secure reset process for your account.">
      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        <label className="block space-y-2 text-sm font-medium text-slate-700">
          <span className="flex items-center gap-2">Email Address or Phone Number</span>
          <input
            className={`w-full rounded-3xl border px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition duration-200 focus:border-[#9b1455] focus:ring-2 focus:ring-[#f8dbe7] ${error ? 'border-rose-500' : 'border-slate-200'}`}
            type="text"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="name@example.com or 01XXXXXXXXX"
            aria-invalid={!!error}
          />
          {error && <p className="text-xs text-rose-600">{error}</p>}
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-3xl bg-[#9b1455] px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-[#9b1455]/20 transition duration-200 hover:-translate-y-0.5 hover:bg-[#7a0f40] active:translate-y-1 disabled:cursor-not-allowed disabled:bg-[#d79bb3]"
        >
          {isSubmitting ? 'Sending...' : 'Send Reset Link'}
        </button>

        <p className="text-center text-sm text-slate-600">
          <Link to="/login/customer" className="font-semibold text-[#9b1455] transition hover:text-[#7a0f40]">
            Back to Login
          </Link>
        </p>
      </form>
    </PageShell>
  );
}

export default CustomerForgotPassword;
