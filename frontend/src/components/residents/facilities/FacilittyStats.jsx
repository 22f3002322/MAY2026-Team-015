import {
  Building2,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";

import Card from "../../ui/Card";

import useFacilityStore from "../../../store/facilityStore";

const FacilityStats = () => {
  const bookings = useFacilityStore(
    (state) => state.bookings
  );

  const total = bookings.length;

  const approved = bookings.filter(
    (booking) =>
      booking.status === "Approved"
  ).length;

  const pending = bookings.filter(
    (booking) =>
      booking.status === "Pending"
  ).length;

  const rejected = bookings.filter(
    (booking) =>
      booking.status === "Rejected"
  ).length;

  const stats = [
    {
      title: "Total Bookings",
      value: total,
      icon: Building2,
      color:
        "bg-indigo-100 text-indigo-600",
    },
    {
      title: "Approved",
      value: approved,
      icon: CheckCircle2,
      color:
        "bg-green-100 text-green-600",
    },
    {
      title: "Pending",
      value: pending,
      icon: Clock3,
      color:
        "bg-amber-100 text-amber-600",
    },
    {
      title: "Rejected",
      value: rejected,
      icon: XCircle,
      color:
        "bg-red-100 text-red-600",
    },
  ];

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

export default FacilityStats;