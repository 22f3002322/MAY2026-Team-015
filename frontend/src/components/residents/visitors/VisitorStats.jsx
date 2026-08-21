import { useMemo } from "react";
import { Users, Clock3, CheckCircle2, Ban } from "lucide-react";

import Card from "../../ui/Card";
import useVisitorStore from "../../../store/visitorStore";

const VisitorStats = ({ visitors: visitorsProp }) => {
  const storeVisitors = useVisitorStore((state) => state.visitors);
  const visitors = visitorsProp || storeVisitors;

  const stats = useMemo(() => {
    const total = visitors.length;
    const expected = visitors.filter(
      (v) => v.statusValue === "expected" || v.status === "Expected"
    ).length;
    const arrived = visitors.filter(
      (v) => v.statusValue === "arrived" || v.status === "Arrived"
    ).length;
    const denied = visitors.filter(
      (v) => v.statusValue === "denied" || v.status === "Denied"
    ).length;

    return [
      {
        title: "Total Visitors",
        value: total,
        icon: Users,
        color: "bg-indigo-100 text-indigo-600",
      },
      {
        title: "Expected",
        value: expected,
        icon: Clock3,
        color: "bg-amber-100 text-amber-600",
      },
      {
        title: "Arrived",
        value: arrived,
        icon: CheckCircle2,
        color: "bg-emerald-100 text-emerald-600",
      },
      {
        title: "Denied",
        value: denied,
        icon: Ban,
        color: "bg-red-100 text-red-600",
      },
    ];
  }, [visitors]);

  return (
    <div className="mb-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.title}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {item.title}
                </p>
                <h2 className="mt-3 text-3xl font-bold text-slate-800 dark:text-slate-100">
                  {item.value}
                </h2>
              </div>
              <div className={`rounded-xl p-3 ${item.color}`}>
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
