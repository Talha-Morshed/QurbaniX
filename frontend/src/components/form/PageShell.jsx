import images from '../../assets/images';

function PageShell({ title, description, children, notice }) {
  return (
    <div className="min-h-screen bg-warm-cream text-slate-900 py-8 sm:py-10 lg:py-12">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10">
          <div className="relative mb-8 overflow-hidden rounded-[1.75rem] bg-primary p-6 text-white shadow-primary-soft sm:p-8">
            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-white">{title}</p>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">{description}</h1>
              </div>
              <img
                src={images.logo}
                alt="QurbaniX"
                className="h-16 w-16 shrink-0 rounded-2xl bg-white/10 object-contain p-2 ring-1 ring-white/20 sm:h-20 sm:w-20"
              />
            </div>
            <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-white/5" aria-hidden="true" />
            <div className="pointer-events-none absolute -bottom-20 right-28 h-44 w-44 rounded-full bg-[rgba(212,167,44,0.15)]" aria-hidden="true" />
          </div>

          {notice && (
            <div className="mb-8 rounded-3xl border border-warm-cream bg-warm-cream px-5 py-4 text-sm text-primary shadow-sm">
              {notice}
            </div>
          )}

          {children}
        </div>
      </div>
    </div>
  );
}

export default PageShell;
