const Card = ({
  children,
  title,
  subtitle,
  action,
  className = "",
  padding = "p-6",
}) => {
  return (
    <div
      className={`
        bg-white dark:bg-slate-900
        rounded-xl
        border border-slate-200 dark:border-slate-800
        shadow-sm
        ${padding}
        ${className}
      `}
    >
      {(title || subtitle || action) && (
        <div className="flex items-start justify-between mb-5">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                {title}
              </h3>
            )}

            {subtitle && (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {subtitle}
              </p>
            )}
          </div>

          {action && (
            <div>
              {action}
            </div>
          )}
        </div>
      )}

      {children}
    </div>
  );
};

export default Card;