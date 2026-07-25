import {
  CalendarDays,
  Users,
  Trash2,
  Eye,
  Ticket,
} from "lucide-react";

import Card from "../../ui/Card";
import Badge from "../../ui/Badge";
import Button from "../../ui/Button";

import useEventStore from "../../../store/eventStore";

const MyRegistrations = ({
  registrations,
  onViewEvent,
}) => {
  const cancelRegistration =
    useEventStore(
      (state) =>
        state.cancelRegistration
    );

  if (registrations.length === 0) {
    return (
      <Card className="py-16">
        <div className="text-center">

          <Ticket
            size={50}
            className="mx-auto text-slate-400"
          />

          <h3 className="mt-5 text-xl font-semibold text-slate-800">
            No Event Registrations
          </h3>

          <p className="mt-2 text-slate-500">
            Register for upcoming events to
            see them here.
          </p>

        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-5">

      {registrations.map(
        (registration) => (
          <Card
            key={registration.id}
            className="p-6"
          >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

              {/* Left */}

              <div className="flex-1">

                <div className="mb-4 flex items-center gap-3">

                  <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                    {
                      registration.eventTitle
                    }
                  </h2>

                  <Badge variant="success">
                    Registered
                  </Badge>

                </div>

                <div className="grid gap-3 text-sm text-slate-600 md:grid-cols-2">

                  <div className="flex items-center gap-2">

                    <Users size={16} />

                    <span>
                      <h3 className="dark:text-slate-100">Attendees :
                      {" "}
                      {
                        registration.members
                      }
                      </h3>
                    </span>

                  </div>

                  <div className="flex items-center gap-2">

                    <CalendarDays
                      size={16}
                    />

                    <span className="dark:text-slate-100">
                      {new Date(
                        registration.registeredAt
                      ).toLocaleDateString()}
                    </span>

                  </div>

                  {registration.remarks && (
                    <div className="md:col-span-2">
                      <span className="font-medium">
                        Remarks:
                      </span>{" "}
                      {
                        registration.remarks
                      }
                    </div>
                  )}

                </div>

              </div>

              {/* Actions */}

              <div className="flex gap-3">

                <Button
                  variant="outline"
                  onClick={() =>
                    onViewEvent(
                      registration.eventId
                    )
                  }
                >
                  <Eye size={18} />

                  View Event
                </Button>

                <Button
                  variant="danger"
                  onClick={() =>
                    cancelRegistration(
                      registration.id
                    )
                  }
                >
                  <Trash2 size={18} />

                  Cancel
                </Button>

              </div>

            </div>
          </Card>
        )
      )}

    </div>
  );
};

export default MyRegistrations;