function TermsSection({ id, title, description, children }) {
  return (
    <section id={id} className="scroll-mt-24 rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
      {description && <p className="mt-3 text-base leading-7 text-slate-600">{description}</p>}
      <div className="mt-5 space-y-4 text-sm leading-7 text-slate-700">{children}</div>
    </section>
  );
}

export default TermsSection;
