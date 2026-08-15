import images from '../../assets/images';

const defaultSteps = [
  { title: '1. Enter phone', description: 'Sign in with your registered mobile number.' },
  { title: '2. Verify PIN', description: 'We send a 4-digit PIN to confirm your identity.' },
  { title: '3. Get started', description: 'Access your dashboard and manage your Qurbani services.' },
];

const defaultWhy = [
  { title: 'Verified Butchers', description: 'We screen and verify all service providers for your peace of mind.' },
  { title: 'Secure Payments', description: 'Encrypted transactions and clear receipts for every booking.' },
  { title: 'Easy Booking', description: 'Fast scheduling and order tracking from your dashboard.' },
];

function LoginShell({
  pageTitle,
  pageDescription,
  notice,
  leftTitle,
  leftDescription,
  formTitle,
  formSubtitle,
  steps = defaultSteps,
  why = defaultWhy,
  children,
}) {
  return (
    <div className="min-h-screen bg-warm-cream text-slate-900 py-8 sm:py-10 lg:py-12">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10">
          <div className="relative mb-8 overflow-hidden rounded-[1.75rem] bg-primary p-6 text-white shadow-primary-soft sm:p-8">
            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-white">{pageTitle}</p>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">{pageDescription}</h1>
              </div>
              <img
                src={images.logo}
                alt="QurbaniX"
                className="h-16 w-16 shrink-0 rounded-2xl bg-white/10 object-contain p-2 ring-1 ring-white/20 sm:h-20 sm:w-20"
              />
            </div>
            <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-white/5" aria-hidden="true" />
            <div className="pointer-events-none absolute -bottom-20 right-28 h-44 w-44 rounded-full bg-[rgba(212,167,44,0.15)]" aria-hidden="true" />
          </div>

          {notice && (
            <div className="mb-8 rounded-3xl border border-warm-cream bg-warm-cream px-5 py-4 text-sm text-primary shadow-sm">
              {notice}
            </div>
          )}

          <div className="mt-6 grid gap-6 lg:grid-cols-2 items-stretch">
            {/* Left: Branding / Welcome */}
            <div className="flex flex-col justify-between gap-6 px-6 py-8 lg:py-10 lg:px-12 h-full">
              <div className="relative">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-semibold text-sm">Verified Butchers</span>
                <h2 className="mt-4 md:mt-6 text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight text-emerald-900">{leftTitle}</h2>
                <p className="mt-3 text-base text-slate-700 max-w-lg">{leftDescription}</p>

                {/* Decorative subtle shape */}
                <div className="pointer-events-none absolute right-2 bottom-2 hidden md:block opacity-60">
                  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="g1" x1="0" x2="1">
                        <stop offset="0%" stopColor="#ECFDF5" />
                        <stop offset="100%" stopColor="#EEF2FF" />
                      </linearGradient>
                    </defs>
                    <rect x="0" y="0" width="120" height="120" rx="24" fill="url(#g1)" />
                  </svg>
                </div>
              </div>

              <div className="hidden md:block">
                <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-warm-cream p-4 shadow-md overflow-hidden">
                  <div className="mt-4 flex flex-col gap-4">
                    <p className="text-sm text-slate-600">Trusted local providers — ethical, verified, and halal.</p>

                    <div className="mt-3 flex flex-wrap items-start gap-6">
                      <div className="flex-1 min-w-[260px]">
                        <div className="w-full h-72 md:h-96 rounded-3xl overflow-hidden bg-white p-2 shadow-2xl flex items-center justify-center">
                          <img src={images.cow} alt="Cow" className="w-full h-full object-contain block" />
                        </div>
                      </div>

                      <div className="flex flex-col gap-4">
                        <div className="w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden bg-white p-2 shadow-lg flex items-center justify-center">
                          <img src={images.goat} alt="Goat" className="w-full h-full object-contain block" />
                        </div>
                        <div className="w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden bg-white p-2 shadow-lg flex items-center justify-center">
                          <img src={images.sheep} alt="Sheep" className="w-full h-full object-contain block" />
                        </div>
                      </div>
                    </div>

                    {/* How it works */}
                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {steps.map((step) => (
                        <div key={step.title} className="rounded-2xl border border-slate-100 bg-white p-4 text-sm shadow-sm">
                          <div className="font-semibold text-slate-800">{step.title}</div>
                          <div className="text-slate-600 mt-1 text-xs">{step.description}</div>
                        </div>
                      ))}
                    </div>

                    {/* Why QurbaniX */}
                    <div className="mt-5">
                      <h4 className="text-sm font-semibold text-slate-800">Why QurbaniX</h4>
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {why.map((item) => (
                          <div key={item.title} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                            <div className="font-medium text-slate-800">{item.title}</div>
                            <div className="text-xs text-slate-500 mt-1">{item.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Form card */}
            <div className="flex items-center justify-center px-4 py-6 sm:px-6 lg:pr-12">
              <div className="w-full max-w-2xl rounded-[1.5rem] border border-slate-100 bg-white p-10 shadow-lg">
                <div className="mb-6">
                  <div className="flex items-center gap-3">
                    <img src={images.logo} alt="QurbaniX" className="h-10 w-10 object-contain rounded-lg" />
                    <div>
                      <h3 className="text-xl md:text-2xl font-semibold text-slate-900">{formTitle}</h3>
                      <p className="hidden md:block text-sm text-slate-600">{formSubtitle}</p>
                    </div>
                  </div>
                </div>

                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginShell;
