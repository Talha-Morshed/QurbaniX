import { useState } from 'react';
import { Link } from 'react-router-dom';
import images from '../../assets/images';

const packageOptions = [
  {
    id: 1,
    name: 'Family Essentials',
    price: '৳18,500',
    badge: 'Most booked',
    description: 'A balanced package for small households with verified butchers and doorstep delivery.',
    features: ['1 full animal share', 'Fresh cut and packaging', 'Flexible delivery window'],
  },
  {
    id: 2,
    name: 'Premium Choice',
    price: '৳24,000',
    badge: 'Best value',
    description: 'A premium selection with priority scheduling and more flexible service coverage.',
    features: ['Priority booking support', 'Premium meat selection', 'Dedicated customer assistance'],
  },
  {
    id: 3,
    name: 'Community Share',
    price: '৳12,900',
    badge: 'Budget friendly',
    description: 'A shared option for community groups that want a simple, affordable experience.',
    features: ['Shared allocation', 'Simple booking flow', 'Verified butcher matching'],
  },
];

function CustomerDashboard() {
  const [selectedPackageId, setSelectedPackageId] = useState(packageOptions[0].id);
  const selectedPackage = packageOptions.find((item) => item.id === selectedPackageId) ?? packageOptions[0];

  return (
    <div className="min-h-screen bg-warm-cream px-6 py-16 sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-6xl flex-col rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-12 lg:p-14">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-3">
              <img src={images.logo} alt="QurbaniX" className="h-10 w-10 object-contain rounded-lg" />
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">QurbaniX</span>
            </div>
            <p className="text-sm uppercase tracking-[0.3em] text-primary">Customer Dashboard</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">Welcome back to your Qurbani planning hub.</h1>
            <p className="mt-5 text-lg text-slate-600">
              Review your upcoming plans, compare available packages, and move closer to a trusted booking experience.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-warm-cream bg-warm-cream p-6 text-sm text-primary lg:min-w-[280px]">
            <p className="font-semibold">What is next?</p>
            <ul className="mt-4 space-y-3 text-primary">
              <li>• Review your recent purchases</li>
              <li>• Manage your delivery preferences</li>
              <li>• Explore available Qurbani packages</li>
            </ul>
            <Link to="/login/customer" className="mt-6 inline-flex rounded-2xl bg-primary px-4 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-primary-dark active:translate-y-1">
              Back to login
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-primary">Recommended packages</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Pick a plan that fits your family</h2>
              </div>
              <span className="inline-flex w-fit rounded-full border border-warm-cream bg-white px-3 py-2 text-sm font-medium text-primary">
                Updated today
              </span>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {packageOptions.map((item) => {
                const isActive = item.id === selectedPackageId;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedPackageId(item.id)}
                    className={`rounded-[1.5rem] border p-5 text-left transition duration-200 ${
                              isActive
                                ? 'border-primary bg-warm-cream shadow-primary'
                                : 'border-slate-200 bg-white hover:border-primary hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                        <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                      </div>
                      <span className="rounded-full accent-badge px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
                        {item.badge}
                      </span>
                    </div>
                    <p className="mt-5 text-2xl font-semibold text-slate-900">{item.price}</p>
                  </button>
                );
              })}
            </div>
          </section>

          <aside className="rounded-[2rem] border border-warm-cream bg-warm-cream p-6 sm:p-8">
            <p className="text-sm uppercase tracking-[0.25em] text-primary">Selected package</p>
            <h3 className="mt-3 text-2xl font-semibold text-slate-900">{selectedPackage.name}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-700">{selectedPackage.description}</p>

            <div className="mt-6 rounded-[1.5rem] border border-warm-cream bg-white p-5">
              <p className="text-sm font-semibold text-slate-900">What is included</p>
              <ul className="mt-4 space-y-3 text-sm text-slate-700">
                {selectedPackage.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <span className="mt-1 text-primary">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              className="mt-6 inline-flex w-full items-center justify-center rounded-3xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-primary-dark active:translate-y-1"
            >
              Book this package
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default CustomerDashboard;
