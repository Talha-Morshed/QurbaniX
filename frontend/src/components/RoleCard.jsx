function RoleCard({ title, description, isSelected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={`premium-action group flex h-full flex-col justify-between rounded-[2rem] border bg-white p-8 text-left shadow-[0_24px_80px_rgba(15,23,42,0.06)] hover:border-primary hover:shadow-primary ${
        isSelected ? 'border-primary ring-2 ring-warm-cream' : 'border-slate-200'
      }`}
    >
      <div>
        <div className="keep-circular mb-6 flex h-6 w-6 items-center justify-center border-2 border-primary" aria-hidden="true">
          {isSelected && <span className="keep-circular h-3 w-3 bg-primary" />}
        </div>
        <h3 className="text-2xl font-semibold text-slate-900">{title}</h3>
        <p className="mt-4 text-slate-600 leading-7">{description}</p>
      </div>
    </button>
  );
}

export default RoleCard;
