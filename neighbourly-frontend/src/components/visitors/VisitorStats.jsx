import {
  Users,
  UserCheck,
  UserPlus,
  Car,
} from "lucide-react";

import Card from "../ui/Card";

import useVisitorStore from "../../store/visitorStore";

const VisitorStats = () => {
  const visitors = useVisitorStore(
    (state) => state.visitors
  );

  const today = new Date().toISOString().split("T")[0];

  const todaysVisitors = visitors.filter((visitor) => {
    if (visitor.visitDate) {
      return visitor.visitDate === today;
    }

    if (visitor.createdAt) {
      return (
        new Date(visitor.createdAt)
          .toISOString()
          .split("T")[0] === today
      );
    }

    return false;
  }).length;

  const checkedIn = visitors.filter(
    (visitor) => visitor.status === "Checked In"
  ).length;

  const expected = visitors.filter(
    (visitor) => visitor.status === "Expected"
  ).length;

  const vehicles = visitors.filter(
    (visitor) =>
      visitor.vehicle &&
      visitor.vehicle.trim() !== ""
  ).length;

  const stats = [
    {
      title: "Today's Visitors",
      value: todaysVisitors,
      icon: Users,
    },
    {
      title: "Checked In",
      value: checkedIn,
      icon: UserCheck,
    },
    {
      title: "Expected Visitors",
      value: expected,
      icon: UserPlus,
    },
    {
      title: "Vehicles",
      value: vehicles,
      icon: Car,
    },
  ];

  return (
    <div className="mb-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <Card
            key={item.title}
            className="transition-all duration-300 hover:shadow-lg"
          >
            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  {item.title}
                </p>

                <h2 className="mt-3 text-3xl font-bold text-slate-800">
                  {item.value}
                </h2>

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