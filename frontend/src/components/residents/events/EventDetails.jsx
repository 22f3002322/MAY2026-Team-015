import {
  CalendarDays,
  Clock3,
  MapPin,
  Users,
  User,
  Ticket,
} from "lucide-react";

import Modal from "../../ui/Modal";
import Badge from "../../ui/Badge";
import Button from "../../ui/Button";

const EventDetails = ({
  event,
  onClose,
  onRegister,
}) => {
  if (!event) return null;

  const seatsLeft =
    event.seats - event.registered;

  const progress =
    (event.registered /
      event.seats) *
    100;

  return (
    <Modal
      open={!!event}
      title="Event Details"
      onClose={onClose}
    >
      <div className="space-y-6">

        {/* Hero */}

        <img
          src={event.image}
          alt={event.title}
          className="h-64 w-full rounded-xl object-cover"
        />

        {/* Header */}

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

          <div>

            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {event.title}
            </h2>

            <p className="mt-1 text-slate-500 dark:text-slate-400">
              Organized by {event.organizer}
            </p>

          </div>

          <Badge variant="primary">
            {event.category}
          </Badge>

        </div>

        {/* Information */}

        <div className="grid gap-5 md:grid-cols-2">

          <div className="flex items-center gap-3">
            <CalendarDays
              size={18}
              className="text-indigo-600"
            />
            <span>{event.date}</span>
          </div>

          <div className="flex items-center gap-3">
            <Clock3
              size={18}
              className="text-indigo-600"
            />
            <span>{event.time}</span>
          </div>

          <div className="flex items-center gap-3">
            <MapPin
              size={18}
              className="text-indigo-600"
            />
            <span>{event.venue}</span>
          </div>

          <div className="flex items-center gap-3">
            <User
              size={18}
              className="text-indigo-600"
            />
            <span>{event.organizer}</span>
          </div>

        </div>

        {/* Seats */}

        <div>

          <div className="mb-2 flex justify-between">

            <span className="font-medium text-slate-700">
              Registration
            </span>

            <span className="text-sm text-slate-500 dark:text-slate-400">
              {event.registered} / {event.seats}
            </span>

          </div>

          <div className="h-3 overflow-hidden rounded-full bg-slate-200">

            <div
              className="h-full rounded-full bg-indigo-600"
              style={{
                width: `${Math.min(
                  progress,
                  100
                )}%`,
              }}
            />

          </div>

          <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">

            <Users size={16} />

            {seatsLeft} seats available

          </div>

        </div>

        {/* Description */}

        <div>

          <h3 className="mb-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
            About Event
          </h3>

          <p className="leading-7 text-slate-600">
            {event.description}
          </p>

        </div>

        {/* Footer */}

        <div className="flex justify-end gap-3">

          <Button
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>

          <Button
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
              : "Registration Closed"}
          </Button>

        </div>

      </div>
    </Modal>
  );
};

export default EventDetails;