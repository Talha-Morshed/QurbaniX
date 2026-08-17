import Navbar from '../Navbar';
import images from '../../assets/images';

const defaultSteps = [
  { title: 'Enter phone', description: 'Sign in with your registered mobile number.' },
  { title: 'Verify PIN', description: 'We send a 4-digit PIN to confirm your identity.' },
  { title: 'Get started', description: 'Access your dashboard and manage your Qurbani services.' },
];

export default function LoginShell({
  pageTitle,
  pageDescription,
  notice,
  leftTitle,
  leftDescription,
  formTitle,
  formSubtitle,
  steps = defaultSteps,
  children,
  splitLayout = false,
  compact = false,
}) {
  if (splitLayout) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-warm-cream p-4 text-slate-900 sm:p-6 lg:h-screen lg:min-h-0 lg:overflow-hidden lg:p-8 xl:p-10">
        <div className="grid w-full border border-white bg-white shadow-[0_28px_80px_rgba(15,23,42,0.14)] lg:h-[calc(100vh-4rem)] lg:w-[min(90vw,1440px)] lg:grid-cols-[45fr_55fr] xl:h-[calc(100vh-5rem)]">
          <section className={`flex items-center bg-warm-cream px-5 py-8 sm:px-10 lg:px-16 xl:px-24 ${compact ? 'lg:py-3' : 'lg:py-6'}`}>
            <div className="mx-auto w-full max-w-md">
              <div className={`${compact ? 'mb-4' : 'mb-8'} flex items-center`}>
                <img src={images.logo} alt="QurbaniX" className="h-24 w-24 object-contain" />
              </div>

              <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">{pageTitle}</p>
              <h1 className={`mt-3 font-bold tracking-tight text-slate-900 ${compact ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'}`}>{leftTitle}</h1>
              <p className={`${compact ? 'mt-2' : 'mt-4'} max-w-lg text-sm leading-6 text-slate-600 sm:text-base`}>{leftDescription}</p>

              {notice && (
                <p className={`${compact ? 'mt-3 py-2' : 'mt-6 py-3'} border-l-4 border-[var(--color-accent)] bg-white px-4 text-sm text-slate-700 shadow-sm`}>
                  {notice}
                </p>
              )}

              <div className={`${compact ? 'mt-4 p-5 sm:p-6' : 'mt-7 p-6 sm:p-8'} border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.08)] lg:h-[340px]`}>
                <div className={compact ? 'mb-4' : 'mb-6'}>
                  <h2 className="text-xl font-semibold text-slate-900">{formTitle}</h2>
                  <p className="mt-2 text-sm text-slate-600">{formSubtitle}</p>
                </div>
                {children}
              </div>
            </div>
          </section>

          <section className="relative min-h-48 max-h-64 overflow-hidden border-t border-slate-200 bg-primary sm:min-h-64 lg:max-h-none lg:border-l lg:border-t-0">
            <img
              src={images.login}
              alt="Qurbani services booking illustration"
              className="h-full w-full object-cover object-center"
            />
            <div className="pointer-events-none absolute inset-0 bg-primary/10" aria-hidden="true" />
          </section>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-warm-cream">
      <Navbar />

      <div className="py-6 text-slate-900 sm:py-8 lg:py-10">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8">

            {/* Compact header */}
            <div className="mb-4 flex items-center justify-between rounded-md bg-primary p-3 text-white">
              <div>
                <p className="text-xs uppercase tracking-[0.25em]">{pageTitle}</p>
                <h1 className="mt-2 text-xl sm:text-2xl font-semibold">{pageDescription}</h1>
              </div>
              {/* Single chosen image: logo */}
              <div className="hidden sm:block">
                <img src={images.logo} alt="QurbaniX" className="h-12 w-auto" />
              </div>
            </div>

            {notice && (
              <div className="mb-4 rounded-lg border border-warm-cream bg-warm-cream px-4 py-2 text-sm text-primary">
                {notice}
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-2 items-stretch">
              {/* Left: text + how-it-works */}
              <div className="flex flex-col justify-between gap-4 px-4 py-4">
                <div>
                  <h2 className="text-2xl font-bold text-emerald-900">{leftTitle}</h2>
                  <p className="mt-2 text-sm text-slate-700 max-w-lg">{leftDescription}</p>
                </div>

                <div className="mt-4">
                  <strong className="text-sm text-slate-800">How it works</strong>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    {steps.map((s, i) => (
                      <div key={i} className="flex flex-col items-start gap-1 rounded-md border border-slate-100 bg-white p-3 text-xs shadow-sm">
                        <div className="keep-circular inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white">{i + 1}</div>
                        <div className="mt-1 font-semibold text-slate-800">{s.title}</div>
                        <div className="text-slate-600">{s.description}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 text-sm text-slate-600">
                  <strong>Why QurbaniX:</strong>
                  <ul className="mt-2 space-y-1 list-disc list-inside text-xs">
                    <li>Verified butchers</li>
                    <li>Secure payments</li>
                    <li>Easy booking</li>
                  </ul>
                </div>
              </div>

              {/* Right: compact form card */}
              <div className="flex items-center justify-center px-4 py-4">
                <div className="w-full max-w-md rounded-lg border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-slate-900">{formTitle}</h3>
                    <p className="text-sm text-slate-600 mt-1">{formSubtitle}</p>
                  </div>

                  {children}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
