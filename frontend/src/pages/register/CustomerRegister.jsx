import { useState } from 'react';
import PageShell from '../../components/form/PageShell';
import FormField from '../../components/form/FormField';

const initialState = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  agree: false,
};

function CustomerRegister() {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const nextErrors = {};

    if (!form.fullName.trim()) nextErrors.fullName = 'Full name is required.';
    if (!form.email.trim()) nextErrors.email = 'Email address is required.';
    if (!form.phone.trim()) nextErrors.phone = 'Phone number is required.';
    if (!form.password.trim()) nextErrors.password = 'Password is required.';
    if (!form.confirmPassword.trim()) nextErrors.confirmPassword = 'Confirm password is required.';
    if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
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
    setSubmitted(true);
    console.log('Customer registration data:', form);
  };

  return (
    <PageShell title="Customer Registration" description="Create your customer account." notice="Start your Qurbani journey with a trusted account.">
      {submitted ? (
        <div className="rounded-3xl border border-pink-100 bg-pink-50 p-8 text-pink-900">
          <h2 className="text-2xl font-semibold">Registration successful</h2>
          <p className="mt-3 text-slate-700">Your customer registration has been submitted. We will notify you once it is ready.</p>
        </div>
      ) : (
        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-6 lg:grid-cols-2">
            <FormField label="Full Name" icon="👤" name="fullName" value={form.fullName} onChange={handleChange} error={errors.fullName} placeholder="Enter your full name" required />
            <FormField label="Email Address" icon="📧" type="email" name="email" value={form.email} onChange={handleChange} error={errors.email} placeholder="name@example.com" required />
            <FormField label="Phone Number" icon="📞" name="phone" value={form.phone} onChange={handleChange} error={errors.phone} placeholder="01XXXXXXXXX" required />
            <FormField label="Password" icon="🔒" type="password" name="password" value={form.password} onChange={handleChange} error={errors.password} placeholder="Create a password" required />
            <FormField label="Confirm Password" icon="🔒" type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} placeholder="Confirm your password" required />
          </div>

          <label className="flex items-start gap-3 text-sm text-slate-700">
            <input type="checkbox" name="agree" checked={form.agree} onChange={handleChange} className="mt-1 h-5 w-5 rounded border-slate-300 text-pink-600 focus:ring-pink-500" />
            <span>
              I agree to the <a href="#" className="font-semibold text-pink-700 hover:text-pink-900">Terms & Conditions</a>.
              {errors.agree && <span className="block text-rose-600">{errors.agree}</span>}
            </span>
          </label>

          <button type="submit" className="inline-flex w-full items-center justify-center rounded-3xl bg-pink-600 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-pink-500/20 transition duration-200 hover:bg-pink-700">
            Register
          </button>

          <p className="text-center text-sm text-slate-600">
            Already have an account? <a href="#" className="font-semibold text-pink-600 hover:text-pink-800">Login</a>
          </p>
        </form>
      )}
    </PageShell>
  );
}

export default CustomerRegister;
