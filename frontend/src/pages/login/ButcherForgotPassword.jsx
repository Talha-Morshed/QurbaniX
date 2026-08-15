import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoginShell from '../../components/form/LoginShell';
import { validatePhone } from '../../utils/validation';

function ButcherForgotPassword() {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      setError('Phone number is required.');
      return false;
    }

    if (!validatePhone(trimmedValue)) {
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
      navigate('/reset-password/butcher');
    }, 800);
  };

  return (
    <LoginShell
      pageTitle="Butcher Forgot Password"
      pageDescription="Recover your butcher account."
      notice="We will guide you through the secure reset process for your account."
      leftTitle="Recover your account"
      leftDescription="Enter your registered phone number and we will send you a code to reset your butcher password securely."
      formTitle="Forgot Password"
      formSubtitle="Enter your phone to receive a reset code."
    >
      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        <label className="block space-y-2 text-sm font-medium text-slate-700">
          <span className="flex items-center gap-2">Phone Number</span>
          <input
            className={`w-full rounded-3xl border px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition duration-200 focus:border-primary focus:ring-2 focus:ring-warm-cream ${error ? 'border-rose-500' : 'border-slate-200'}`}
            type="text"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="01XXXXXXXXX"
            aria-invalid={!!error}
          />
          {error && <p className="text-xs text-rose-600">{error}</p>}
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-3xl bg-primary px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-primary transition duration-200 hover:-translate-y-0.5 hover:bg-primary-dark active:translate-y-1 disabled:cursor-not-allowed disabled:bg-warm-cream"
        >
          {isSubmitting ? 'Sending...' : 'Send Reset Code'}
        </button>

        <p className="text-center text-sm text-slate-600">
          <Link to="/login/butcher" className="font-semibold text-primary transition hover:text-primary-dark">
            Back to Login
          </Link>
        </p>
      </form>
    </LoginShell>
  );
}

export default ButcherForgotPassword;
