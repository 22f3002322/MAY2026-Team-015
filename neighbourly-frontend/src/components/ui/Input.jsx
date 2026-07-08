import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const Input = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  name,
  disabled = false,
  required = false,
  error = "",
  icon: Icon,
  className = "",
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const inputType =
    type === "password"
      ? showPassword
        ? "text"
        : "password"
      : type;

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label
          htmlFor={name}
          className="text-sm font-medium text-slate-700"
        >
          {label}

          {required && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <Icon
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        )}

        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={`
            w-full
            rounded-xl
            border
            bg-white
            px-4
            py-3
            text-sm
            text-slate-700
            outline-none
            transition-all
            duration-200
            placeholder:text-slate-400

            ${
              Icon
                ? "pl-10"
                : ""
            }

            ${
              type === "password"
                ? "pr-12"
                : ""
            }

            ${
              error
                ? "border-red-500 focus:border-red-500"
                : "border-slate-300 focus:border-indigo-600"
            }

            ${
              disabled
                ? "cursor-not-allowed bg-slate-100"
                : ""
            }

            ${className}
          `}
        />

        {type === "password" && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
            onClick={() =>
              setShowPassword(!showPassword)
            }
          >
            {showPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;