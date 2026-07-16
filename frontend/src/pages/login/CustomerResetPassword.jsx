import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../../components/form/PageShell';
import PasswordField from '../../components/form/PasswordField';

function CustomerResetPassword() {
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const passwordChecks = [
    { label: 'At least 8 characters', test: (value) => value.length >= 8 },
    { label: 'Contains an uppercase letter', test: (value) => /[A-Z]/.test(value) },
    { label: 'Contains a lowercase letter', test: (value) => /[a-z]/.test(value) },
    { label: 'Contains a number', test: (value) => /\d/.test(value) },
  ];

  const validate = () => {
    const nextErrors = {};
    const password = form.password;
    const confirmPassword = form.confirmPassword;

    if (!password.trim()) {
      nextErrors.password = 'New password is required.';
    } else if (!passwordChecks.every((check) => check.test(password))) {
      nextErrors.password = 'Password does not meet the requirements.';
    }

    if (!confirmPassword.trim()) {
      nextErrors.confirmPassword = 'Please confirm your new password.';
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

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

    setIsSubmitting(true);
    window.setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 800);
  };

  return (
    <PageShell title="Customer Reset Password" description="Set a new password." notice="Choose a strong password to keep your account safe.">
      {isSuccess ? (
        <div className="rounded-[2rem] border border-[#f4d4e2] bg-[#fff4f8] p-8 text-center text-[#9b1455] shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#9b1455] text-3xl text-white">✓</div>
          <h2 className="mt-6 text-2xl font-semibold">Password reset successful</h2>
          <p className="mt-3 text-sm text-slate-700">Your customer password has been updated. You can now sign in with your new credentials.</p>
          <Link to="/login/customer" className="mt-6 inline-flex rounded-3xl bg-[#9b1455] px-6 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#7a0f40] active:translate-y-1">
            Back to Login
          </Link>
        </div>
      ) : (
        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
          <PasswordField
            label="New Password"
            name="password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="Enter a strong password"
            showPassword={showPassword}
            onToggleShowPassword={() => setShowPassword((value) => !value)}
          />

          <PasswordField
            label="Confirm New Password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            placeholder="Re-enter your password"
            showPassword={showConfirmPassword}
            onToggleShowPassword={() => setShowConfirmPassword((value) => !value)}
          />

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Password requirements</p>
            <ul className="mt-3 space-y-2">
              {passwordChecks.map((check) => {
                const passed = check.test(form.password);
                return (
                  <li key={check.label} className={`flex items-center gap-2 ${passed ? 'text-emerald-600' : 'text-slate-600'}`}>
                    <span>{passed ? '✓' : '•'}</span>
                    {check.label}
                  </li>
                );
              })}
            </ul>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center rounded-3xl bg-[#9b1455] px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-[#9b1455]/20 transition duration-200 hover:-translate-y-0.5 hover:bg-[#7a0f40] active:translate-y-1 disabled:cursor-not-allowed disabled:bg-[#d79bb3]"
          >
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      )}
    </PageShell>
  );
}

export default CustomerResetPassword;
