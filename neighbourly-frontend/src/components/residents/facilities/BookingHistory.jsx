import {
  CalendarDays,
  Clock3,
  Eye,
  Trash2,
  Building2,
} from "lucide-react";

import Card from "../../ui/Card";
import Badge from "../../ui/Badge";
import Button from "../../ui/Button";

import useFacilityStore from "../../../store/facilityStore";

const BookingHistory = ({
  bookings,
  onView,
}) => {
  const deleteBooking =
    useFacilityStore(
      (state) => state.deleteBooking
    );

  const statusVariant = {
    Approved: "success",
    Pending: "warning",
    Rejected: "danger",
  };

  if (bookings.length === 0) {
    return (
      <Card className="py-16">
        <div className="text-center">
          <Building2
            size={48}
            className="mx-auto text-slate-400"
          />

          <h3 className="mt-4 text-xl font-semibold text-slate-800">
            No Bookings Yet
          </h3>

          <p className="mt-2 text-slate-500">
            Your facility bookings will
            appear here.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {bookings.map((booking) => (
        <Card
          key={booking.id}
          className="p-6"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            {/* Left */}

            <div className="flex-1">

              <div className="mb-3 flex flex-wrap items-center gap-3">

                <h2 className="text-lg font-semibold text-slate-800">
                  {booking.facility}
                </h2>

                <Badge
                  variant={
                    statusVariant[
                      booking.status
                    ] || "default"
                  }
                >
                  {booking.status}
                </Badge>

              </div>

              <div className="grid gap-3 text-sm text-slate-600 md:grid-cols-3">

                <div className="flex items-center gap-2">
                  <CalendarDays size={16} />
                  {booking.date}
                </div>

                <div className="flex items-center gap-2">
                  <Clock3 size={16} />
                  {booking.time}
                </div>

                <div>
                  <span className="font-medium">
                    Purpose:
                  </span>{" "}
                  {booking.purpose}
                </div>

              </div>

            </div>

            {/* Right */}

            <div className="flex gap-3">

              <Button
                variant="outline"
                onClick={() =>
                  onView(booking)
                }
              >
                <Eye size={18} />
                Details
              </Button>

              {booking.status ===
                "Pending" && (
                <Button
                  variant="danger"
                  onClick={() =>
                    deleteBooking(
                      booking.id
                    )
                  }
                >
                  <Trash2 size={18} />
                  Cancel
                </Button>
              )}

            </div>

          </div>
        </Card>
      ))}
    </div>
  );
};

export default BookingHistory;