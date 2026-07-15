import { useState } from 'react';
import PageShell from '../../components/form/PageShell';
import FormField from '../../components/form/FormField';

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

  const validate = () => {
    const nextErrors = {};
    if (!form.fullName.trim()) nextErrors.fullName = 'Full name is required.';
    if (!form.orgName.trim()) nextErrors.orgName = 'Organization/Admin name is required.';
    if (!form.email.trim()) nextErrors.email = 'Official email is required.';
    if (!form.phone.trim()) nextErrors.phone = 'Phone number is required.';
    if (!form.password.trim()) nextErrors.password = 'Password is required.';
    if (!form.confirmPassword.trim()) nextErrors.confirmPassword = 'Confirm password is required.';
    if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
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
    console.log('Administrator registration data:', form);
  };

  return (
    <PageShell
      title="Administrator Registration"
      description="Register as an administrator."
      notice="Administrator accounts require approval before activation."
    >
      {submitted ? (
        <div className="rounded-3xl border border-pink-100 bg-pink-50 p-8 text-pink-900">
          <h2 className="text-2xl font-semibold">Registration submitted</h2>
          <p className="mt-3 text-slate-700">Your admin registration request has been received and is pending approval.</p>
        </div>
      ) : (
        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-6 lg:grid-cols-2">
            <FormField label="Full Name" icon="👤" name="fullName" value={form.fullName} onChange={handleChange} error={errors.fullName} placeholder="Enter your full name" required />
            <FormField label="Organization/Admin Name" icon="🏢" name="orgName" value={form.orgName} onChange={handleChange} error={errors.orgName} placeholder="Enter organization or admin name" required />
            <FormField label="Official Email" icon="📧" type="email" name="email" value={form.email} onChange={handleChange} error={errors.email} placeholder="admin@example.com" required />
            <FormField label="Phone Number" icon="📞" name="phone" value={form.phone} onChange={handleChange} error={errors.phone} placeholder="01XXXXXXXXX" required />
            <FormField label="Password" icon="🔒" type="password" name="password" value={form.password} onChange={handleChange} error={errors.password} placeholder="Create a password" required />
            <FormField label="Confirm Password" icon="🔒" type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} placeholder="Confirm your password" required />
          </div>

          <button type="submit" className="inline-flex w-full items-center justify-center rounded-3xl bg-pink-600 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-pink-500/20 transition duration-200 hover:bg-pink-700">
            Register
          </button>
        </form>
      )}
    </PageShell>
  );
}

export default AdminRegister;
