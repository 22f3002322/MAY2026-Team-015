import Card from "../ui/Card";

const StatCard = ({
  title,
  value,
  change,
  trend = "up",
}) => {
  return (
    <Card className="transition-all hover:shadow-md">
      <p className="text-sm text-slate-500">
        {title}
      </p>

      <h2 className="mt-3 text-3xl font-bold text-slate-800">
        {value}
      </h2>

      {change && (
        <p
          className={`mt-2 text-sm font-medium ${
            trend === "up"
              ? "text-emerald-600"
              : "text-red-600"
          }`}
        >
          {change} this month
        </p>
      )}
    </Card>
  );
};

export default StatCard;