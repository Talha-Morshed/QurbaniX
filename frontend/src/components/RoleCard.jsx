function RoleCard({ icon, title, description, isSelected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`premium-action group flex h-full flex-col justify-between rounded-[2rem] border bg-white p-5 sm:p-6 md:p-8 text-left shadow-[0_24px_80px_rgba(15,23,42,0.06)] hover:border-primary hover:shadow-primary ${
        isSelected ? 'border-primary ring-2 ring-warm-cream' : 'border-slate-200'
      }`}
    >
      <div>
        <div className="mb-4 sm:mb-6 inline-flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 items-center justify-center rounded-3xl bg-warm-cream text-3xl sm:text-4xl transition duration-300 group-hover:bg-warm-cream">
          <span aria-hidden="true">{icon}</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-semibold text-slate-900">{title}</h3>
        <p className="mt-3 sm:mt-4 text-sm sm:text-base text-slate-600 leading-6 sm:leading-7">{description}</p>
      </div>
    </button>
  );
}

export default RoleCard;
