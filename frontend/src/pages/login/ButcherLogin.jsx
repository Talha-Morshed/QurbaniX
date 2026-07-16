import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageShell from '../../components/form/PageShell';
import { validateEmail, validatePhone } from '../../utils/validation';

function ButcherLogin() {
  const [form, setForm] = useState({
    identifier: '',
    password: '',
    remember: false,
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const nextErrors = {};
    const identifier = form.identifier.trim();

    if (!identifier) {
      nextErrors.identifier = 'Email address or phone number is required.';
    } else if (identifier.includes('@')) {
      if (!validateEmail(identifier)) {
        nextErrors.identifier = 'Please enter a valid email address.';
      }
    } else if (!validatePhone(identifier)) {
      nextErrors.identifier = 'Please enter a valid phone number.';
    }

    if (!form.password.trim()) {
      nextErrors.password = 'Password is required.';
    } else if (form.password.trim().length < 6) {
      nextErrors.password = 'Password must be at least 6 characters.';
    }

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

    setIsSubmitting(true);
    window.setTimeout(() => {
      setIsSubmitting(false);
      navigate('/dashboard/butcher', { replace: true });
    }, 800);
  };

  return (
    <PageShell title="Butcher Login" description="Access your butcher account." notice="Manage your order requests and business profile from one secure hub.">
      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        <div className="space-y-5">
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            <span className="flex items-center gap-2">
              <span className="text-pink-600">📧</span>
              Email Address or Phone Number
            </span>
            <input
              className={`w-full rounded-3xl border px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition duration-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 ${errors.identifier ? 'border-rose-500' : 'border-slate-200'}`}
              type="text"
              name="identifier"
              value={form.identifier}
              onChange={handleChange}
              placeholder="name@example.com or 01XXXXXXXXX"
              aria-invalid={!!errors.identifier}
            />
            {errors.identifier && <p className="text-xs text-rose-600">{errors.identifier}</p>}
          </label>

          <label className="block space-y-2 text-sm font-medium text-slate-700">
            <span className="flex items-center gap-2">
              <span className="text-pink-600">🔒</span>
              Password
            </span>
            <div className="relative">
              <input
                className={`w-full rounded-3xl border px-4 py-3 pr-24 text-sm text-slate-900 shadow-sm outline-none transition duration-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 ${errors.password ? 'border-rose-500' : 'border-slate-200'}`}
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                aria-invalid={!!errors.password}
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute inset-y-0 right-4 flex items-center text-sm font-semibold text-pink-600 transition hover:text-pink-800"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && <p className="text-xs text-rose-600">{errors.password}</p>}
          </label>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-3 text-sm text-slate-700">
            <input type="checkbox" name="remember" checked={form.remember} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-pink-600 focus:ring-pink-500" />
            Remember Me
          </label>
          <a href="#" className="text-sm font-semibold text-pink-600 transition hover:text-pink-800">
            Forgot Password?
          </a>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-3xl bg-pink-600 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-pink-500/20 transition duration-200 hover:bg-pink-700 disabled:cursor-not-allowed disabled:bg-pink-400"
        >
          {isSubmitting ? 'Signing In...' : 'Login'}
        </button>

        <p className="text-center text-sm text-slate-600">
          Don&apos;t have an account?{' '}
          <Link to="/register/butcher" className="font-semibold text-pink-600 transition hover:text-pink-800">
            Register
          </Link>
        </p>
      </form>
    </PageShell>
  );
}

export default ButcherLogin;
