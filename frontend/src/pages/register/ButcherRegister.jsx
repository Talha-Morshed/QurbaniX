import { useState } from 'react';
import PageShell from '../../components/form/PageShell';
import FormField from '../../components/form/FormField';
import { validateEmail, validatePhone } from '../../utils/validation';
import { BANGLADESH_DISTRICTS } from '../../constants/locations';

const initialState = {
  fullName: '',
  shopName: '',
  nationalId: '',
  phone: '',
  email: '',
  address: '',
  experience: '',
  serviceArea: '',
  password: '',
  confirmPassword: '',
};

function ButcherRegister() {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const nextErrors = {};
    if (!form.fullName.trim()) nextErrors.fullName = 'Full name is required.';
    if (!form.nationalId.trim()) nextErrors.nationalId = 'National ID is required.';
    if (!form.phone.trim()) {
      nextErrors.phone = 'Phone number is required.';
    } else if (!validatePhone(form.phone)) {
      nextErrors.phone = 'Please enter a valid phone number.';
    }
    if (!form.email.trim()) {
      nextErrors.email = 'Email address is required.';
    } else if (!validateEmail(form.email)) {
      nextErrors.email = 'Please enter a valid email address.';
    }
    if (!form.address.trim()) nextErrors.address = 'Address is required.';
    if (!form.experience.trim()) nextErrors.experience = 'Years of experience is required.';
    if (!form.serviceArea.trim()) nextErrors.serviceArea = 'Service area is required.';
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
    console.log('Butcher registration data:', form);
  };

  return (
    <PageShell
      title="Butcher Registration"
      description="Apply as a verified butcher."
      notice="Registration is subject to administrator verification before the account becomes active."
    >
      {submitted ? (
        <div className="rounded-3xl border border-pink-100 bg-pink-50 p-8 text-pink-900">
          <h2 className="text-2xl font-semibold">Registration submitted</h2>
          <p className="mt-3 text-slate-700">Your butcher application has been received. It will be reviewed before activation.</p>
        </div>
      ) : (
        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-6 lg:grid-cols-2">
            <FormField label="Full Name" icon="👤" name="fullName" value={form.fullName} onChange={handleChange} error={errors.fullName} placeholder="Enter your full name" required />
            <FormField label="Business/Shop Name" icon="🏪" name="shopName" value={form.shopName} onChange={handleChange} placeholder="Optional" />
            <FormField label="National ID Number" icon="🪪" name="nationalId" value={form.nationalId} onChange={handleChange} error={errors.nationalId} placeholder="Enter your national ID" required />
            <FormField label="Phone Number" icon="📞" name="phone" value={form.phone} onChange={handleChange} error={errors.phone} placeholder="01XXXXXXXXX" required />
            <FormField label="Email Address" icon="📧" type="email" name="email" value={form.email} onChange={handleChange} error={errors.email} placeholder="name@example.com" required />
            <FormField label="Address" icon="📍" name="address" value={form.address} onChange={handleChange} error={errors.address} placeholder="Enter your address" required suggestions={BANGLADESH_DISTRICTS} />
            <FormField label="Years of Experience" icon="⏳" name="experience" value={form.experience} onChange={handleChange} error={errors.experience} placeholder="e.g. 5" required />
            <FormField label="Service Area" icon="🌍" name="serviceArea" value={form.serviceArea} onChange={handleChange} error={errors.serviceArea} placeholder="Enter your service area" required suggestions={BANGLADESH_DISTRICTS} />
            <FormField label="Password" icon="🔒" type="password" name="password" value={form.password} onChange={handleChange} error={errors.password} placeholder="Create a password" required />
            <FormField label="Confirm Password" icon="🔒" type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} placeholder="Confirm your password" required />
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

          <button type="submit" className="inline-flex w-full items-center justify-center rounded-3xl bg-pink-600 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-pink-500/20 transition duration-200 hover:bg-pink-700">
            Register
          </button>
        </form>
      )}
    </PageShell>
  );
}

export default ButcherRegister;
