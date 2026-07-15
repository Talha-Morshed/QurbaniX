import RoleCard from '../../components/RoleCard';

const roles = [
  {
    icon: '👤',
    title: 'Customer',
    description: 'Browse verified butchers, compare prices, and book your Qurbani service with confidence.',
  },
  {
    icon: '🔪',
    title: 'Butcher (কসাই)',
    description: 'Manage availability, accept bookings, and offer verified Qurbani services to customers.',
  },
  {
    icon: '🛡️',
    title: 'Administrator',
    description: 'Review registrations, verify butchers, and supervise bookings across the platform.',
  },
];

function SelectRole() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto max-w-6xl px-6 pb-16 pt-16 sm:px-8 lg:px-10">
        <div className="rounded-[2rem] border border-pink-100 bg-white/95 p-10 shadow-[0_30px_80px_rgba(155,20,85,0.1)] sm:p-14">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex rounded-full bg-pink-100 px-4 py-2 text-sm font-semibold tracking-wide text-pink-700">
              Choose your path
            </span>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Who is using QurbaniX today?
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Select the experience that matches your role. This is a safe place to explore the platform.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {roles.map((role) => (
              <RoleCard key={role.title} {...role} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default SelectRole;
