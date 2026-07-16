function PasswordField({ label, name, value, onChange, error, placeholder, showPassword, onToggleShowPassword }) {
  return (
    <label className="block space-y-2 text-sm font-medium text-slate-700">
      <span className="flex items-center gap-2">{label}</span>
      <div className="relative">
        <input
          className={`w-full rounded-3xl border px-4 py-3 pr-24 text-sm text-slate-900 shadow-sm outline-none transition duration-200 focus:border-[#9b1455] focus:ring-2 focus:ring-[#f8dbe7] ${error ? 'border-rose-500' : 'border-slate-200'}`}
          type={showPassword ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          aria-invalid={!!error}
        />
        <button
          type="button"
          onClick={onToggleShowPassword}
          className="absolute inset-y-0 right-4 flex items-center text-sm font-semibold text-[#9b1455] transition hover:text-[#7a0f40]"
        >
          {showPassword ? 'Hide' : 'Show'}
        </button>
      </div>
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </label>
  );
}

export default PasswordField;
