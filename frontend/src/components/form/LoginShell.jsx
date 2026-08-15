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
}) {
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
                        <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white">{i + 1}</div>
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
