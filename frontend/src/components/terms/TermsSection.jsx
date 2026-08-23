function TermsSection({ id, title, description, children }) {
  return (
    <section id={id} className="scroll-mt-24 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-6 md:p-8">
      <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">{title}</h2>
      {description && <p className="mt-2 sm:mt-3 text-sm sm:text-base leading-6 sm:leading-7 text-slate-600">{description}</p>}
      <div className="mt-4 sm:mt-5 space-y-3 sm:space-y-4 text-xs sm:text-sm leading-6 sm:leading-7 text-slate-700">{children}</div>
    </section>
  );
}

export default TermsSection;
