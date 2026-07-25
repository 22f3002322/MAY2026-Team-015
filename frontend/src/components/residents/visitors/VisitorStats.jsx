import { useMemo } from "react";
import {
  Users,
  Clock3,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import Card from "../../ui/Card";
import useVisitorStore from "../../../store/visitorStore";

const VisitorStats = () => {
  const visitors = useVisitorStore(
    (state) => state.visitors
  );

  const stats = useMemo(() => {
    const total = visitors.length;

    const expected = visitors.filter(
      (visitor) => visitor.status === "Expected"
    ).length;

    const checkedIn = visitors.filter(
      (visitor) => visitor.status === "Checked In"
    ).length;

    const completed = visitors.filter(
      (visitor) =>
        visitor.status === "Completed"
    ).length;

    return [
      {
        title: "Total Visitors",
        value: total,
        icon: Users,
        color:
          "bg-indigo-100 text-indigo-600",
      },
      {
        title: "Expected",
        value: expected,
        icon: Clock3,
        color:
          "bg-amber-100 text-amber-600",
      },
      {
        title: "Checked In",
        value: checkedIn,
        icon: CheckCircle2,
        color:
          "bg-emerald-100 text-emerald-600",
      },
      {
        title: "Completed",
        value: completed,
        icon: XCircle,
        color:
          "bg-slate-100 text-slate-600",
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

              <div
                className={`rounded-xl p-3 ${item.color}`}
              >
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