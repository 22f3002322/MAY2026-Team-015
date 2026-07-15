import { useMemo } from "react";
import {
  ClipboardList,
  Clock3,
  Wrench,
  CheckCircle2,
} from "lucide-react";

import Card from "../../ui/Card";

import useComplaintStore from "../../../store/complaintStore";

const ComplaintStats = () => {
  const complaints = useComplaintStore(
    (state) => state.complaints
  );

  const stats = useMemo(() => {
    const total = complaints.length;

    const open = complaints.filter(
      (item) => item.status === "Open"
    ).length;

    const progress = complaints.filter(
      (item) => item.status === "In Progress"
    ).length;

    const resolved = complaints.filter(
      (item) => item.status === "Resolved"
    ).length;

    return [
      {
        title: "Total Complaints",
        value: total,
        icon: ClipboardList,
        color: "bg-indigo-100 text-indigo-600",
      },
      {
        title: "Open",
        value: open,
        icon: Clock3,
        color: "bg-red-100 text-red-600",
      },
      {
        title: "In Progress",
        value: progress,
        icon: Wrench,
        color: "bg-amber-100 text-amber-600",
      },
      {
        title: "Resolved",
        value: resolved,
        icon: CheckCircle2,
        color: "bg-emerald-100 text-emerald-600",
      },
    ];
  }, [complaints]);

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

export default ComplaintStats;