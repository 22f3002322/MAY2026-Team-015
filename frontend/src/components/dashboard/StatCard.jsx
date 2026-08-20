import Card from "../ui/Card";

const StatCard = ({
  title,
  value,
  change,
  trend = "up",
  icon: Icon = null,
  iconColor = "bg-blue-100 text-blue-600",
}) => {
  const hasIcon = Boolean(Icon);

  return (
    <Card className="transition-all hover:shadow-md">
      <div
        className={
          hasIcon
            ? "flex items-center justify-between"
            : ""
        }
      >
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <h2 className="mt-3 text-3xl font-bold text-slate-800 dark:text-slate-100">
            {value}
          </h2>

          {change && (
            <p
              className={`mt-2 text-sm font-medium ${
                trend === "up"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {change} this month
            </p>
          )}
        </div>

        {hasIcon && (
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${iconColor}`}
          >
            <Icon size={28} />
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatCard;
