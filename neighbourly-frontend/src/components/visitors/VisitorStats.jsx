import {
  Users,
  UserCheck,
  UserPlus,
  Car,
} from "lucide-react";

import Card from "../ui/Card";

const stats = [
  {
    title: "Today's Visitors",
    value: "32",
    change: "+8%",
    trend: "up",
    icon: Users,
  },
  {
    title: "Checked In",
    value: "18",
    change: "+4%",
    trend: "up",
    icon: UserCheck,
  },
  {
    title: "Expected Visitors",
    value: "7",
    change: "+2%",
    trend: "up",
    icon: UserPlus,
  },
  {
    title: "Vehicles",
    value: "12",
    change: "+5%",
    trend: "up",
    icon: Car,
  },
];

const VisitorStats = () => {
  return (
    <div className="mb-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <Card
            key={item.title}
            className="hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  {item.title}
                </p>

                <h2 className="mt-3 text-3xl font-bold text-slate-800">
                  {item.value}
                </h2>

                <p
                  className={`mt-2 text-sm font-medium ${
                    item.trend === "up"
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  {item.change} this month
                </p>
              </div>

              <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600">
                <Icon size={24} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default VisitorStats;