function FormField({ label, icon, type = 'text', name, value, onChange, error, required = false, placeholder, suggestions }) {
  const listId = suggestions ? `${name}-suggestions` : undefined;
  return (
    <label className="space-y-2 text-sm font-medium text-slate-700">
      <span className="flex items-center gap-2">
        {icon}
        {label}
        {required && <span className="text-pink-600">*</span>}
      </span>
      <input
        className={`w-full rounded-3xl border px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition duration-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 ${
          error ? 'border-rose-500' : 'border-slate-200'
        }`}
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        list={listId}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      {suggestions && (
        <datalist id={listId}>
          {suggestions.map((option, index) => (
            <option key={index} value={option} />
          ))}
        </datalist>
      )}
      {error && (
        <p id={`${name}-error`} className="text-xs text-rose-600">
          {error}
        </p>
      )}
    </label>
  );
}

export default FormField;
