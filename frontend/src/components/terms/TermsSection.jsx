function TermsSection({ id, title, description, number, children }) {
  return (
    <section id={id} className="scroll-mt-6 border-b border-primary/25 pb-8 pt-2 last:border-b-0 sm:pb-10">
      <div className="grid gap-4 sm:grid-cols-[72px_minmax(0,1fr)] sm:gap-7">
        <span className="text-4xl font-semibold leading-none tracking-tight text-[#d4a72c] sm:text-5xl">{number}</span>
        <div>
              <h2 className="text-xl font-semibold tracking-tight text-primary sm:text-2xl">{title}</h2>
            {description && <p className="mt-3 text-base leading-7 text-slate-600">{description}</p>}
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-700">{children}</div>
        </div>
      </div>
    </section>
  );
}

export default TermsSection;
