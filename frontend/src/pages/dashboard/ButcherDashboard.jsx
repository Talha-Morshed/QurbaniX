import { Link } from 'react-router-dom';

function ButcherDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-16 sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-5xl flex-col rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-12 lg:flex-row lg:items-center lg:justify-between lg:p-14">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.3em] text-[#9b1455]">Butcher Dashboard</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">Your business hub is ready.</h1>
          <p className="mt-5 text-lg text-slate-600">
            This placeholder page will soon host order requests, inventory updates, and profile management tools.
          </p>
        </div>

        <div className="mt-8 rounded-[1.5rem] border border-[#f4d4e2] bg-[#fff4f8] p-6 text-sm text-[#9b1455] lg:mt-0">
          <p className="font-semibold">Upcoming features</p>
          <ul className="mt-4 space-y-3 text-[#9b1455]">
            <li>• Track incoming customer requests</li>
            <li>• Update availability and pricing</li>
            <li>• Manage delivery zones</li>
          </ul>
          <Link to="/login/butcher" className="mt-6 inline-flex rounded-2xl bg-[#9b1455] px-4 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#7a0f40] active:translate-y-1">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ButcherDashboard;
