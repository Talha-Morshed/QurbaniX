const steps = [
  {
    number: '01',
    title: 'Find a Verified Butcher',
    description:
      'Browse trusted and verified butchers based on their services, location, experience, ratings, and availability.',
  },
  {
    number: '02',
    title: 'Compare & Choose',
    description:
      'Compare butcher profiles, transparent pricing, customer ratings, and services to choose the professional that best fits your needs.',
  },
  {
    number: '03',
    title: 'Book Your Service',
    description:
      'Select your preferred date and time, submit your booking request, and pay a small advance online to confirm your booking.',
  },
  {
    number: '04',
    title: 'Complete Your Qurbani',
    description:
      'The butcher completes the service at your scheduled location. Pay the remaining amount, confirm completion, and share your experience.',
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-gray-50 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
        <div className="max-w-2xl mx-auto text-center">
          <span className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 font-semibold text-sm uppercase tracking-widest">
            HOW IT WORKS
          </span>
          <h2 className="mt-6 text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight text-emerald-900">
            Qurbani Made Simple.
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            From finding a trusted professional to completing your service, QurbaniX makes every step simple,
            transparent, and reliable.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="premium-action group flex h-full flex-col bg-white ring-1 ring-slate-200 shadow-sm hover:shadow-lg p-6 md:p-7"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-5xl md:text-6xl font-extrabold leading-none tracking-[-0.04em] text-emerald-900">
                  {step.number}
                </span>
                {index < steps.length - 1 && (
                  <span className="hidden xl:block text-2xl leading-none text-slate-300">→</span>
                )}
              </div>

              <h3 className="mt-6 text-xl font-bold text-emerald-900">{step.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-slate-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
