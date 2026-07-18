import { Link } from 'react-router-dom';

const packageStats = [
  { title: 'Active Packages', value: '12', note: '3 ready for dispatch' },
  { title: 'Requests Today', value: '18', note: '5 urgent orders' },
  { title: 'Revenue', value: 'PKR 144K', note: 'vs. PKR 126K last week' },
];

const packageList = [
  { name: 'Standard Qurbani', price: 'PKR 56,000', status: 'Available', eta: '4 hours' },
  { name: 'Premium Goat', price: 'PKR 84,000', status: 'Low stock', eta: 'Today' },
  { name: 'Family Bundle', price: 'PKR 110,000', status: 'Available', eta: '6 hours' },
];

const incomingRequests = [
  { customer: 'Ayesha Khan', package: 'Family Bundle', location: 'Rawalpindi', priority: 'High' },
  { customer: 'Usman Ali', package: 'Standard Qurbani', location: 'Islamabad', priority: 'Medium' },
  { customer: 'Maria Sami', package: 'Premium Goat', location: 'Lahore', priority: 'Low' },
];

function ButcherDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)] md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#9b1455]">Butcher Dashboard</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Welcome back, Qurbani partner.</h1>
            <p className="mt-2 text-slate-600">Manage package availability, confirm delivery requests, and monitor daily business performance.</p>
          </div>

          <div className="flex gap-3">
            <Link to="/" className="rounded-2xl border border-slate-300 px-4 py-2.5 font-medium text-slate-700 transition hover:border-[#9b1455] hover:text-[#9b1455]">
              Home
            </Link>
            <Link to="/login/butcher" className="rounded-2xl bg-[#9b1455] px-4 py-2.5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#7a0f40] active:translate-y-1">
              Logout
            </Link>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {packageStats.map((item) => (
            <article key={item.title} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">{item.title}</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-900">{item.value}</h2>
              <p className="mt-2 text-sm text-slate-600">{item.note}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
          <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Package management</h2>
                <p className="text-sm text-slate-500">Keep your Qurbani packages accurate and ready for customers.</p>
              </div>
              <span className="rounded-full bg-[#fff4f8] px-3 py-1 text-xs font-semibold text-[#9b1455]">Live</span>
            </div>

            <div className="mt-6 space-y-4">
              {packageList.map((item) => (
                <div key={item.name} className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">{item.name}</h3>
                      <p className="text-sm text-slate-500">{item.price}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">ETA: {item.eta}</span>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.status === 'Available' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <aside className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Incoming requests</h2>
            <p className="mt-1 text-sm text-slate-500">Priority queue for customer package requests.</p>

            <div className="mt-5 space-y-3">
              {incomingRequests.map((request) => (
                <div key={`${request.customer}-${request.package}`} className="rounded-[1.1rem] border border-[#f4d4e2] bg-[#fff4f8] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{request.customer}</p>
                      <p className="text-sm text-slate-600">{request.package}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#9b1455]">{request.priority}</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">{request.location}</p>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="mt-8 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Operations snapshot</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.25rem] bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Inventory status</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">Healthy</p>
            </div>
            <div className="rounded-[1.25rem] bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Delivery coverage</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">12 zones</p>
            </div>
            <div className="rounded-[1.25rem] bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Profile completion</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">88%</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ButcherDashboard;
