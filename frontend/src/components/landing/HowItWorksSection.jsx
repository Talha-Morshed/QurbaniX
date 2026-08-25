const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <circle cx="11" cy="11" r="6" />
    <path d="M16 16l5 5" />
  </svg>
);

const CompareIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M4 18V8M10 18V4M16 18v-7M22 18V6" />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <rect x="3" y="5" width="18" height="16" rx="0" />
    <path d="M8 3v4M16 3v4M3 10h18" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M5 13l4 4L19 3" />
  </svg>
);

const steps = [
  {
    icon: <SearchIcon />,
    title: 'Find a Verified Butcher',
    description:
      'Browse trusted and verified butchers based on their services, location, experience, ratings, and availability.',
  },
  {
    icon: <CompareIcon />,
    title: 'Compare & Choose',
    description:
      'Compare butcher profiles, transparent pricing, customer ratings, and services to choose the professional that best fits your needs.',
  },
  {
    icon: <CalendarIcon />,
    title: 'Book Your Service',
    description:
      'Select your preferred date and time, submit your booking request, and pay a small advance online to confirm your booking.',
  },
  {
    icon: <CheckIcon />,
    title: 'Complete Your Qurbani',
    description:
      'The butcher completes the service at your scheduled location. Pay the remaining amount, confirm completion, and share your experience.',
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-gray-50 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
        <div className="max-w-2xl mx-auto text-center">
          <span className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 font-semibold text-sm uppercase tracking-widest">
            HOW IT WORKS
          </span>
          <h2 className="mt-6 text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight text-emerald-900">
            Qurbani Made Simple.
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            From finding a trusted professional to completing your service, QurbaniX makes every step simple,
            transparent, and reliable.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {steps.map((step, index) => {
            const isDark = index % 2 === 1;

            return (
              <div
                key={step.title}
                className={`premium-action group flex h-full flex-col p-6 md:p-7 shadow-sm hover:shadow-lg ${
                  isDark ? 'bg-emerald-900 ring-1 ring-emerald-900' : 'bg-white ring-1 ring-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div
                    className={`inline-flex items-center justify-center w-14 h-14 ${
                      isDark ? 'bg-white text-emerald-900' : 'bg-emerald-900 text-[#D4A72C]'
                    }`}
                  >
                    {step.icon}
                  </div>

                  {index < steps.length - 1 && (
                    <span className={`hidden xl:block text-2xl leading-none ${isDark ? 'text-emerald-700' : 'text-slate-300'}`}>
                      →
                    </span>
                  )}
                </div>

                <h3 className={`mt-6 text-xl font-bold ${isDark ? 'text-white' : 'text-emerald-900'}`}>
                  {step.title}
                </h3>
                <p className={`mt-3 text-base leading-relaxed ${isDark ? 'text-emerald-50' : 'text-slate-600'}`}>
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
