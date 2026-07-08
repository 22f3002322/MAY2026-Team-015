import { Loader2 } from "lucide-react";

const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon: Icon,
  className = "",
  onClick,
}) => {
  const baseStyle =
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300",

    secondary:
      "bg-slate-100 text-slate-800 hover:bg-slate-200",

    outline:
      "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",

    danger:
      "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300",

    ghost:
      "bg-transparent text-slate-700 hover:bg-slate-100",
  };

  const sizes = {
    sm: "px-3 py-2 text-sm",

    md: "px-4 py-2.5 text-sm",

    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        Icon && <Icon size={18} />
      )}

      {children}
    </button>
  );
};

export default Button;