import {
  CalendarDays,
  Building2,
  IndianRupee,
  Clock,
} from "lucide-react";

import Card from "../ui/Card";

const stats = [
  {
    title: "Total Bookings",
    value: "128",
    change: "+12%",
    trend: "up",
    icon: CalendarDays,
  },

  {
    title: "Active Facilities",
    value: "8",
    change: "+2%",
    trend: "up",
    icon: Building2,
  },

  {
    title: "Revenue",
    value: "₹42,500",
    change: "+18%",
    trend: "up",
    icon: IndianRupee,
  },

  {
    title: "Pending Requests",
    value: "14",
    change: "-4%",
    trend: "down",
    icon: Clock,
  },
];

const BookingStats = () => {
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

export default BookingStats;