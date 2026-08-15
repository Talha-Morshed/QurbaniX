function PageShell({ title, description, children, notice }) {
  return (
    <div className="min-h-screen bg-warm-cream text-slate-900 py-8 sm:py-10 lg:py-12">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10">
          <div className="mb-8 overflow-hidden rounded-[1.75rem] bg-primary p-6 text-white shadow-primary-soft sm:p-8">
            <p className="text-sm uppercase tracking-[0.3em] text-white">{title}</p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">{description}</h1>
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
