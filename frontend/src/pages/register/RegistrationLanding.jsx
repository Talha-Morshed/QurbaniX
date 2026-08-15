import { useState } from 'react';
import PageShell from '../../components/form/PageShell';
import CustomerRegisterForm from './CustomerRegisterForm';
import ButcherRegisterForm from './ButcherRegisterForm';

export default function RegistrationLanding() {
  const [role, setRole] = useState(null); // 'customer' | 'butcher'

  return (
    <PageShell title="Register" description="Create your account.">
      <div className="space-y-6">
        <p className="text-sm text-slate-700">Select your role and complete the registration form below.</p>

        <div className="grid gap-6 sm:grid-cols-2">
          <div
            role="button"
            tabIndex={0}
            onClick={() => setRole('customer')}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setRole('customer')}
            className={`relative cursor-pointer overflow-hidden rounded-2xl border bg-white p-6 text-left shadow-lg transition transform hover:-translate-y-1 ${
              role === 'customer' ? 'border-[#9b1455] ring-2 ring-[#f8dbe7]' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                <div className={`h-3 w-3 rounded-full mr-3 ${role === 'customer' ? 'bg-[#9b1455]' : 'border border-slate-300 bg-white'}`} />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">Customer</div>
                <div className="text-xs text-slate-500 mt-1">Browse, book and manage orders</div>
              </div>
            </div>
          </div>

          <div
            role="button"
            tabIndex={0}
            onClick={() => setRole('butcher')}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setRole('butcher')}
            className={`relative cursor-pointer overflow-hidden rounded-2xl border bg-white p-6 text-left shadow-lg transition transform hover:-translate-y-1 ${
              role === 'butcher' ? 'border-[#9b1455] ring-2 ring-[#f8dbe7]' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                <div className={`h-3 w-3 rounded-full mr-3 ${role === 'butcher' ? 'bg-[#9b1455]' : 'border border-slate-300 bg-white'}`} />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">Butcher</div>
                <div className="text-xs text-slate-500 mt-1">Apply as a service provider</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          {role === 'customer' && <CustomerRegisterForm />}
          {role === 'butcher' && <ButcherRegisterForm />}
          {!role && (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-sm text-slate-600">Select a role above to begin registration.</div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
