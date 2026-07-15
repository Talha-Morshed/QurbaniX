function PageShell({ title, description, children, notice }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-6xl px-6 sm:px-8 lg:px-10">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-12 lg:p-14">
          <div className="mb-10 overflow-hidden rounded-[1.75rem] bg-gradient-to-r from-[#9b1455] via-[#a12767] to-[#e11d48] p-8 text-white shadow-[0_24px_80px_rgba(155,20,85,0.16)]">
            <p className="text-sm uppercase tracking-[0.3em] text-pink-100">{title}</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">{description}</h1>
          </div>

          {notice && (
            <div className="mb-8 rounded-3xl border border-pink-100 bg-pink-50 px-5 py-4 text-sm text-pink-800 shadow-sm">
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
