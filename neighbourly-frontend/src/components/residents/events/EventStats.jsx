import {
  CalendarDays,
  Users,
  CheckCircle2,
  Clock3,
} from "lucide-react";

import Card from "../../ui/Card";

import useEventStore from "../../../store/eventStore";

const EventStats = () => {
  const events = useEventStore(
    (state) => state.events
  );

  const registrations = useEventStore(
    (state) => state.registrations
  );

  const totalEvents = events.length;

  const upcomingEvents = events.filter(
    (event) =>
      new Date(event.date) >=
      new Date()
  ).length;

  const registeredEvents =
    registrations.length;

  const openRegistrations =
    events.filter(
      (event) =>
        event.registrationOpen
    ).length;

  const stats = [
    {
      title: "Total Events",
      value: totalEvents,
      icon: CalendarDays,
      color:
        "bg-indigo-100 text-indigo-600",
    },
    {
      title: "Upcoming",
      value: upcomingEvents,
      icon: Clock3,
      color:
        "bg-amber-100 text-amber-600",
    },
    {
      title: "My Registrations",
      value: registeredEvents,
      icon: CheckCircle2,
      color:
        "bg-green-100 text-green-600",
    },
    {
      title: "Open Registration",
      value: openRegistrations,
      icon: Users,
      color:
        "bg-blue-100 text-blue-600",
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

export default EventStats;