/*
 * ── AdminRegister visual redesign ────────────────────────────────────
 * • Replaced PageShell with its own split-layout shell (mirrors LoginShell).
 * • Left panel  – warm-cream bg, logo, green header banner, notice banner,
 *                form card with all six fields.
 * • Right panel – full-height green bg with images.login butcher image and
 *                decorative circular overlays.
 * • All original form state, validation, and submit logic is preserved.
 * • No rounded corners; brand colours (bg-primary, text-primary, etc.) used
 *   throughout.  Submit button uses the premium-action class.
 */

import { useState } from 'react';
import Navbar from '../../components/Navbar';
import FormField from '../../components/form/FormField';
import images from '../../assets/images';
import { validateEmail, validatePhone } from '../../utils/validation';

const initialState = {
  fullName: '',
  orgName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
};

function AdminRegister() {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const isDev =
    typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.MODE !== 'production';

  /* ── validation ─────────────────────────────────────────────────── */
  const validate = () => {
    const nextErrors = {};
    if (!form.fullName.trim()) nextErrors.fullName = 'Full name is required.';
    if (!form.orgName.trim())
      nextErrors.orgName = 'Organization/Admin name is required.';
    if (!form.email.trim()) {
      nextErrors.email = 'Official email is required.';
    } else if (!validateEmail(form.email)) {
      nextErrors.email = 'Please enter a valid email address.';
    }
    if (!form.phone.trim()) {
      nextErrors.phone = 'Phone number is required.';
    } else if (!validatePhone(form.phone)) {
      nextErrors.phone = 'Please enter a valid phone number.';
    }
    if (!form.password.trim()) nextErrors.password = 'Password is required.';
    if (!form.confirmPassword.trim())
      nextErrors.confirmPassword = 'Confirm password is required.';
    if (
      form.password &&
      form.confirmPassword &&
      form.password !== form.confirmPassword
    ) {
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
    setSubmitted(true);
    if (isDev) {
      // eslint-disable-next-line no-console
      console.log('Administrator registration data:', form);
    }
  };

  /* ── success state ──────────────────────────────────────────────── */
  if (submitted) {
    return (
      <div className="min-h-screen bg-warm-cream">
        <Navbar hideHomeButton hideLogo />
        <div className="flex items-center justify-center px-4 py-16">
          <div className="border border-warm-cream bg-warm-cream p-8 text-primary shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
            <h2 className="text-2xl font-semibold">Registration submitted</h2>
            <p className="mt-3 text-slate-700">
              Your admin registration request has been received and is pending
              approval.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ── main render – split layout ─────────────────────────────────── */
  return (
    <div className="min-h-screen bg-warm-cream">
      <Navbar hideHomeButton hideLogo />

      <div className="py-6 text-slate-900 sm:py-8 lg:py-10">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid w-full border border-white bg-white shadow-[0_28px_80px_rgba(15,23,42,0.14)] lg:h-[calc(100vh-8rem)] lg:grid-cols-[55fr_45fr]">

            {/* ── Left panel ──────────────────────────────────────── */}
            <section className="flex items-center bg-warm-cream px-5 py-8 sm:px-10 lg:px-16 xl:px-24 lg:py-6">
              <div className="mx-auto w-full max-w-md">

                {/* Logo */}
                <div className="mb-8 flex items-center">
                  <img
                    src={images.logo}
                    alt="QurbaniX"
                    className="h-24 w-24 object-contain"
                  />
                </div>

                {/* Green header banner */}
                <div className="mb-6 rounded-[1.75rem] bg-primary p-6 text-white shadow-primary-soft sm:p-8">
                  <p className="text-xs font-bold uppercase tracking-[0.24em]">
                    Administrator Registration
                  </p>
                  <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                    Register as an Administrator
                  </h1>
                  <p className="mt-4 max-w-lg text-sm leading-6 text-white/80 sm:text-base">
                    Create your administrator account to manage QurbaniX
                    services, butchers, and customers from a single dashboard.
                  </p>
                </div>

                {/* Notice banner */}
                <p className="mt-6 border-l-4 border-[var(--color-accent)] bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
                  Administrator accounts require approval before activation.
                </p>

                {/* Form card */}
                <div className="mt-7 border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] sm:p-8 lg:h-[340px]">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-slate-900">
                      Admin Details
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                      Fill in the information below to request an admin account.
                    </p>
                  </div>

                  <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                    <div className="grid gap-6 lg:grid-cols-2">
                      <FormField
                        label="Full Name"
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                        error={errors.fullName}
                        placeholder="Enter your full name"
                        required
                      />
                      <FormField
                        label="Organization/Admin Name"
                        name="orgName"
                        value={form.orgName}
                        onChange={handleChange}
                        error={errors.orgName}
                        placeholder="Enter organization or admin name"
                        required
                      />
                      <FormField
                        label="Official Email"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        error={errors.email}
                        placeholder="admin@example.com"
                        required
                      />
                      <FormField
                        label="Phone Number"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        error={errors.phone}
                        placeholder="01XXXXXXXXX"
                        required
                      />
                      <FormField
                        label="Password"
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        error={errors.password}
                        placeholder="Create a password"
                        required
                      />
                      <FormField
                        label="Confirm Password"
                        type="password"
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        error={errors.confirmPassword}
                        placeholder="Confirm your password"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="premium-action inline-flex w-full items-center justify-center bg-primary px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-primary hover:bg-primary-dark"
                    >
                      Register
                    </button>
                  </form>
                </div>

              </div>
            </section>

            {/* ── Right panel ─────────────────────────────────────── */}
            <section className="relative min-h-48 max-h-64 overflow-hidden border-t border-slate-200 bg-primary sm:min-h-64 lg:max-h-none lg:border-l lg:border-t-0">
              <img
                src={images.login}
                alt="Qurbani services illustration"
                className="h-full w-full object-cover object-center"
              />

              {/* Decorative circular overlays */}
              <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/5" aria-hidden="true" />
              <div className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-white/5" aria-hidden="true" />
              <div className="pointer-events-none absolute left-1/2 top-1/3 h-40 w-40 -translate-x-1/2 rounded-full bg-white/5" aria-hidden="true" />

              <div className="pointer-events-none absolute inset-0 bg-primary/10" aria-hidden="true" />
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminRegister;
