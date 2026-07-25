import {
  CalendarDays,
  Clock3,
  MapPin,
  Users,
  Eye,
  Ticket,
} from "lucide-react";

import Card from "../../ui/Card";
import Badge from "../../ui/Badge";
import Button from "../../ui/Button";

const EventCard = ({
  event,
  onView,
  onRegister,
}) => {
  const seatsLeft =
    event.seats - event.registered;

  const progress =
    (event.registered /
      event.seats) *
    100;

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

      {/* Banner */}

      <img
        src={event.image}
        alt={event.title}
        className="h-56 w-full object-cover"
      />

      <div className="p-6">

        {/* Header */}

        <div className="mb-4 flex items-start justify-between gap-3">

          <div>

            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {event.title}
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {event.organizer}
            </p>

          </div>

          <Badge variant="primary">
            {event.category}
          </Badge>

        </div>

        {/* Description */}

        <p className="line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          {event.description}
        </p>

        {/* Information */}

        <div className="mt-6 space-y-3">

          <div className="flex items-center gap-3">

            <CalendarDays
              size={18}
              className="text-indigo-600"
            />

            <span className="text-sm">
              {event.date}
            </span>

          </div>

          <div className="flex items-center gap-3">

            <Clock3
              size={18}
              className="text-indigo-600"
            />

            <span className="text-sm">
              {event.time}
            </span>

          </div>

          <div className="flex items-center gap-3">

            <MapPin
              size={18}
              className="text-indigo-600"
            />

            <span className="text-sm">
              {event.venue}
            </span>

          </div>

          <div className="flex items-center gap-3">

            <Users
              size={18}
              className="text-indigo-600"
            />

            <span className="text-sm">
              {seatsLeft} seats left
            </span>

          </div>

        </div>

        {/* Progress */}

        <div className="mt-6">

          <div className="mb-2 flex justify-between text-xs text-slate-500 dark:text-slate-400">

            <span>
              Registrations
            </span>

            <span>
              {event.registered} /{" "}
              {event.seats}
            </span>

          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-200">

            <div
              className="h-full rounded-full bg-indigo-600 transition-all"
              style={{
                width: `${Math.min(
                  progress,
                  100
                )}%`,
              }}
            />

          </div>

        </div>

        {/* Footer */}

        <div className="mt-6 flex gap-3">

          <Button
            variant="outline"
            className="flex-1"
            onClick={() =>
              onView(event)
            }
          >
            <Eye size={18} />

            Details
          </Button>

          <Button
            className="flex-1"
            disabled={
              !event.registrationOpen ||
              seatsLeft <= 0
            }
            onClick={() =>
              onRegister(event)
            }
          >
            <Ticket size={18} />

            {event.registrationOpen
              ? "Register"
              : "Closed"}
          </Button>

        </div>

      </div>
    </Card>
  );
};

export default EventCard;