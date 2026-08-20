const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M12 3l7 3v5c0 4.5-3 8.4-7 10-4-1.6-7-5.5-7-10V6l7-3z" />
    <path d="M9.2 12l2 2 3.6-4" />
  </svg>
);

const TagIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M20.6 13.4L11 3.8a2 2 0 00-1.4-.6H4a1 1 0 00-1 1v5.6c0 .5.2 1 .6 1.4l9.6 9.6a2 2 0 002.8 0l4.6-4.6a2 2 0 000-2.8z" />
    <circle cx="7.5" cy="7.5" r="1.2" />
  </svg>
);

const TruckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" />
    <circle cx="7" cy="18" r="1.8" />
    <circle cx="17" cy="18" r="1.8" />
  </svg>
);

const features = [
  {
    icon: <ShieldIcon />,
    title: 'Verified Professionals',
    desc: 'Every butcher on QurbaniX passes identity, skill, and hygiene checks before they can take a single booking.',
  },
  {
    icon: <TagIcon />,
    title: 'Transparent Pricing',
    desc: 'Clear, upfront rates with zero hidden charges. Compare butchers side by side and choose with confidence.',
  },
  {
    icon: <TruckIcon />,
    title: 'Doorstep Service',
    desc: 'Book online in minutes and get a reliable professional at your doorstep, on the schedule that suits you.',
  },
];

export default function AboutSection() {
  return (
    <section id="about" className="bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
        <div className="max-w-2xl mx-auto text-center">
          <span className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 font-semibold text-sm uppercase tracking-widest">About QurbaniX</span>
          <h2 className="mt-6 text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight text-emerald-900">Qurbani, Done The Right Way</h2>
          <p className="mt-4 text-lg text-slate-600">
            We connect families with trusted, verified butchers—so your sacred obligation is fulfilled with dignity,
            hygiene, and complete peace of mind.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="premium-action group bg-white ring-1 ring-slate-200 shadow-sm hover:shadow-xl p-8 flex flex-col items-start gap-5"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-900 text-[#D4A72C]">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-emerald-900">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-emerald-900 px-8 py-8 lg:px-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <p className="text-lg lg:text-xl font-medium text-emerald-50 max-w-3xl">
            “From booking to completion, QurbaniX handled everything—professional, clean, and respectful.”
          </p>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-3xl font-extrabold text-[#D4A72C]">15k+</span>
            <span className="text-sm text-emerald-100 leading-tight">families served<br />across the country</span>
          </div>
        </div>
      </div>
    </section>
  );
}
