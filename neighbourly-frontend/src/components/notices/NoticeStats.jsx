import {
  Bell,
  Megaphone,
  FileText,
  Clock,
} from "lucide-react";

import Card from "../ui/Card";

const stats = [
  {
    title: "Total Notices",
    value: "48",
    change: "+6%",
    trend: "up",
    icon: Bell,
  },
  {
    title: "Published",
    value: "38",
    change: "+4%",
    trend: "up",
    icon: Megaphone,
  },
  {
    title: "Draft",
    value: "6",
    change: "+2%",
    trend: "up",
    icon: FileText,
  },
  {
    title: "Expiring Soon",
    value: "4",
    change: "-1%",
    trend: "down",
    icon: Clock,
  },
];

const NoticeStats = () => {
  return (
    <div className="mb-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <Card key={item.title}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  {item.title}
                </p>

                <h2 className="mt-3 text-3xl font-bold">
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

export default NoticeStats;