import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../../components/form/PageShell';
import CustomerRegisterForm from './CustomerRegisterForm';
import ButcherRegisterForm from './ButcherRegisterForm';
import images from '../../assets/images';

export default function RegistrationLanding() {
  const [role, setRole] = useState(null); // 'customer' | 'butcher'
  const [completed, setCompleted] = useState(false);
  const activeStep = !role ? 1 : completed ? 3 : 2;

  return (
    <PageShell title="Register" description="Create your account.">
      <div className="mt-6 grid gap-6 lg:grid-cols-2 items-stretch">
        {/* Left: Branding / Welcome */}
        <div className="flex flex-col justify-between gap-6 px-6 py-8 lg:py-10 lg:px-12 h-full">
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-semibold text-sm">Verified Butchers</span>
            <h1 className="mt-4 md:mt-6 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight text-emerald-900">Welcome to QurbaniX</h1>
            <p className="mt-3 text-base text-slate-700 max-w-lg">Join verified butchers and customers on QurbaniX — book trusted services, manage orders, and connect with local providers.</p>
          </div>

          <div className="hidden md:block">
            <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-warm-cream p-4 shadow-md overflow-hidden">
              <div className="flex flex-wrap items-start gap-6">
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
            </div>
          </div>
        </div>

        {/* Right: Form card */}
        <div className="flex items-center justify-center px-4 py-6 sm:px-6 lg:pr-12">
          <div className="w-full max-w-2xl rounded-[1.5rem] border border-slate-100 bg-white p-10 shadow-lg">
            <div className="mb-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={images.logo} alt="QurbaniX" className="h-10 w-10 object-contain rounded-lg" />
                  <div className="flex items-baseline gap-6">
                    <h3 className="text-xl md:text-2xl font-semibold text-slate-900">
                      {role === 'customer' ? 'Customer Registration' : role === 'butcher' ? 'Butcher Registration' : 'Select your role'}
                    </h3>
                    <p className="hidden md:block text-sm text-slate-600">
                      {role ? 'Complete the form and verify your phone number.' : 'Pick an account type to continue.'}
                    </p>
                  </div>
                </div>

                <Link to="/login/customer" className="shrink-0 text-sm font-semibold text-primary transition hover:text-primary-dark">
                  Sign in
                </Link>
              </div>
            </div>

            {/* Step indicator */}
            <div className="mb-4">
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <div className={`flex items-center gap-2 ${activeStep===1? 'text-emerald-700 font-semibold':''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${activeStep===1? 'bg-emerald-700 text-white':'bg-slate-100 text-slate-600'}`}>1</div>
                  <div>Choose role</div>
                </div>
                <div className="h-px flex-1 bg-slate-100" />
                <div className={`flex items-center gap-2 ${activeStep===2? 'text-emerald-700 font-semibold':''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${activeStep===2? 'bg-emerald-700 text-white':'bg-slate-100 text-slate-600'}`}>2</div>
                  <div>Account details</div>
                </div>
                <div className="h-px flex-1 bg-slate-100" />
                <div className={`flex items-center gap-2 ${activeStep===3? 'text-emerald-700 font-semibold':''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${activeStep===3? 'bg-emerald-700 text-white':'bg-slate-100 text-slate-600'}`}>3</div>
                  <div>Complete</div>
                </div>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setRole('customer'); setCompleted(false); }}
                className={`flex items-center justify-center gap-2 rounded-3xl px-4 py-3 text-sm font-semibold transition transform ${
                  role === 'customer' ? 'bg-emerald-700 text-white shadow-md' : 'bg-slate-50 text-slate-700 border border-slate-100'
                } hover:scale-[1.02] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-emerald-200`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12a5 5 0 100-10 5 5 0 000 10zM3 21a9 9 0 1118 0H3z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Customer
              </button>

              <button
                type="button"
                onClick={() => { setRole('butcher'); setCompleted(false); }}
                className={`flex items-center justify-center gap-2 rounded-3xl px-4 py-3 text-sm font-semibold transition transform ${
                  role === 'butcher' ? 'bg-emerald-700 text-white shadow-md' : 'bg-slate-50 text-slate-700 border border-slate-100'
                } hover:scale-[1.02] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-emerald-200`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7h18M7 21h10M12 3v18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Butcher
              </button>
            </div>

            <div>
              {role === 'customer' && <CustomerRegisterForm onComplete={() => setCompleted(true)} showLogin={false} />}
              {role === 'butcher' && <ButcherRegisterForm onComplete={() => setCompleted(true)} showLogin={false} />}
              {!role && (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-sm text-slate-600">Select a role above to begin registration.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
