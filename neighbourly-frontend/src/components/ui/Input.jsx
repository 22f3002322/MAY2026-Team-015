import React from "react";

const Input = ({
  label,
  icon: Icon,
  error,
  className = "",
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <Icon
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
        )}

        <input
          {...props}
          className={`
            h-14 w-full rounded-xl border bg-white
            ${Icon ? "pl-11" : "px-4"}
            pr-4
            ${
              error
                ? "border-red-500 focus:border-red-500"
                : "border-slate-300 focus:border-indigo-600"
            }
            outline-none transition-all duration-200
            ${className}
          `}
        />
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;