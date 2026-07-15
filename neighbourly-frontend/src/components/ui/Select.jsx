const Select = ({
  label,
  options = [],
  placeholder = "Select",
  error,
  className = "",
  id,
  ...props
}) => {
  const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <select
          id={selectId}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : undefined}
          {...props}
          className={`
            h-14
            w-full
            rounded-xl
            border
            bg-white
            px-4
            outline-none
            transition-all
            duration-200
            appearance-none
            focus:ring-2
            focus:ring-offset-0

            ${
              error
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-slate-300 dark:border-slate-700 focus:border-indigo-600 focus:ring-indigo-600"
            }

            dark:bg-slate-900
            dark:text-white

            ${className}
          `}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}

          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom Chevron icon */}
        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {error && (
        <p id={`${selectId}-error`} className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default Select;