import { X } from "lucide-react";

const Input = ({
  label,
  icon: Icon,
  error,
  className = "",
  value,
  onClear,
  id,
  placeholder,
  ...props
}) => {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);
  const defaultPlaceholder = label ? `Enter ${label}...` : "";
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <Icon
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            aria-hidden="true"
          />
        )}

        <input
          id={inputId}
          value={value}
          placeholder={placeholder || defaultPlaceholder}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
          className={`
            h-14 w-full rounded-xl border bg-white dark:bg-slate-900 dark:text-white
            ${Icon ? "pl-11" : "px-4"}
            ${onClear ? "pr-11" : "pr-4"}

            ${
              error
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-slate-300 dark:border-slate-700 focus:border-indigo-600 focus:ring-indigo-600"
            }

            outline-none transition-all duration-200 focus:ring-2 focus:ring-offset-0
            ${className}
          `}
        />

        {onClear && value && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear input"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;