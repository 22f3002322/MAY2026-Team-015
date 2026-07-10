import {
  AlertCircle,
  UserCheck,
  Wrench,
  CheckCircle2,
} from "lucide-react";

import Card from "../ui/Card";

const stats = [
  {
    title: "Open",
    value: 14,
    icon: AlertCircle,
    color: "bg-red-100 text-red-600",
  },
  {
    title: "Assigned",
    value: 9,
    icon: UserCheck,
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "In Progress",
    value: 6,
    icon: Wrench,
    color: "bg-orange-100 text-orange-600",
  },
  {
    title: "Resolved",
    value: 52,
    icon: CheckCircle2,
    color: "bg-green-100 text-green-600",
  },
];

const ComplaintStats = () => {
  return (
    <div className="mb-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <Card key={item.title}>
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500">
                  {item.title}
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-800">
                  {item.value}
                </h2>
              </div>

              <div
                className={`flex h-14 w-14 items-center justify-center rounded-xl ${item.color}`}
              >
                <Icon size={28} />
              </div>

            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default ComplaintStats;