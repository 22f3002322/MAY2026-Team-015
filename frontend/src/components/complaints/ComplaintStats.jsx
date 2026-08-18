import {
  AlertCircle,
  UserCheck,
  Wrench,
  CheckCircle2,
} from "lucide-react";

import Card from "../ui/Card";

import useComplaintStore from "../../store/complaintStore";

const ComplaintStats = () => {
  const complaints = useComplaintStore(
    (state) => state.complaints
  );

  const open = complaints.filter(
    (c) => c.status === "Open"
  ).length;

  const assigned = complaints.filter(
    (c) =>
      c.status === "Assigned" ||
      (c.assignedTo && c.status === "Open")
  ).length;

  const inProgress = complaints.filter(
    (c) => c.status === "In Progress"
  ).length;

  const resolved = complaints.filter(
    (c) => c.status === "Resolved" || c.status === "Closed"
  ).length;

  const stats = [
    {
      title: "Open",
      value: open,
      icon: AlertCircle,
      color: "bg-red-100 text-red-600",
    },
    {
      title: "Assigned",
      value: assigned,
      icon: UserCheck,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "In Progress",
      value: inProgress,
      icon: Wrench,
      color: "bg-orange-100 text-orange-600",
    },
    {
      title: "Resolved",
      value: resolved,
      icon: CheckCircle2,
      color: "bg-green-100 text-green-600",
    },
  ];

  return (
    <div className="mb-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <Card key={item.title}>
            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {item.title}
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-800 dark:text-slate-100">
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