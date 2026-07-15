function RoleCard({ icon, title, description }) {
  return (
    <div className="group flex h-full flex-col justify-between rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:border-pink-300 hover:shadow-pink-200/30">
      <div>
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-pink-50 text-4xl transition duration-300 group-hover:bg-pink-100">
          <span aria-hidden="true">{icon}</span>
        </div>
        <h3 className="text-2xl font-semibold text-slate-900">{title}</h3>
        <p className="mt-4 text-slate-600 leading-7">{description}</p>
      </div>
    </div>
  );
}

export default RoleCard;
