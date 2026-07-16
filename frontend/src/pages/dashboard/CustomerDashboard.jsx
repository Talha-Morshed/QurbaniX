import { Link } from 'react-router-dom';

function CustomerDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-16 sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-5xl flex-col rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-12 lg:flex-row lg:items-center lg:justify-between lg:p-14">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.3em] text-[#9b1455]">Customer Dashboard</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">Welcome to your placeholder dashboard.</h1>
          <p className="mt-5 text-lg text-slate-600">
            This screen is ready for future customer features such as orders, saved addresses, and wishlist items.
          </p>
        </div>

        <div className="mt-8 rounded-[1.5rem] border border-[#f4d4e2] bg-[#fff4f8] p-6 text-sm text-[#9b1455] lg:mt-0">
          <p className="font-semibold">What is next?</p>
          <ul className="mt-4 space-y-3 text-[#9b1455]">
            <li>• Review your recent purchases</li>
            <li>• Manage your delivery preferences</li>
            <li>• Explore available Qurbani packages</li>
          </ul>
          <Link to="/login/customer" className="mt-6 inline-flex rounded-2xl bg-[#9b1455] px-4 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#7a0f40] active:translate-y-1">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CustomerDashboard;
