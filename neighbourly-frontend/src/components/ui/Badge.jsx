const Badge = ({
  children,
  variant = "default",
  className = "",
}) => {
  const variants = {
    default: "bg-slate-100 text-slate-700",

    primary: "bg-indigo-100 text-indigo-700",

    success: "bg-emerald-100 text-emerald-700",

    warning: "bg-amber-100 text-amber-700",

    danger: "bg-red-100 text-red-700",

    info: "bg-sky-100 text-sky-700",

    purple: "bg-purple-100 text-purple-700",
  };

  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        px-3
        py-1
        text-xs
        font-medium
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

export default Badge;