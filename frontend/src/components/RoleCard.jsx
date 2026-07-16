function RoleCard({ icon, title, description, isSelected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group flex h-full flex-col justify-between rounded-[2rem] border bg-white p-8 text-left shadow-[0_24px_80px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:border-[#9b1455] hover:shadow-[#9b1455]/20 active:translate-y-1 ${
        isSelected ? 'border-[#9b1455] ring-2 ring-[#fde8f0]' : 'border-slate-200'
      }`}
    >
      <div>
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-[#ffe1ed] text-4xl transition duration-300 group-hover:bg-[#f4c5db]">
          <span aria-hidden="true">{icon}</span>
        </div>
        <h3 className="text-2xl font-semibold text-slate-900">{title}</h3>
        <p className="mt-4 text-slate-600 leading-7">{description}</p>
      </div>
    </button>
  );
}

export default RoleCard;
