import Card from "../ui/Card";

const StatCard = ({
  title,
  value,
  change,
  trend = "up",
}) => {
  return (
    <Card className="transition-all hover:shadow-md">
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
    </Card>
  );
};

export default StatCard;