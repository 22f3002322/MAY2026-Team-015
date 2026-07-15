import { useMemo } from "react";
import { CalendarDays } from "lucide-react";

import Card from "../../ui/Card";
import Badge from "../../ui/Badge";
import Button from "../../ui/Button";

import useFacilityStore from "../../../store/facilityStore";

const FacilityBookings = () => {
  const bookings = useFacilityStore(
    (state) => state.bookings
  );

  const upcomingBookings = useMemo(() => {
    return [...bookings]
      .sort(
        (a, b) =>
          new Date(a.date) -
          new Date(b.date)
      )
      .slice(0, 5);
  }, [bookings]);

  const getVariant = (status) => {
    switch (status) {
      case "Approved":
        return "success";

      case "Pending":
        return "warning";

      case "Rejected":
        return "danger";

      default:
        return "default";
    }
  };

  return (
    <Card
      title="Facility Bookings"
      subtitle="Your upcoming bookings"
    >
      {upcomingBookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10">
          <CalendarDays
            size={42}
            className="mb-3 text-slate-400"
          />

          <p className="text-slate-500 dark:text-slate-400">
            No bookings found.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {upcomingBookings.map((booking) => (
            <div
              key={booking.id}
              className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 transition hover:border-indigo-300 hover:shadow-sm"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                    {booking.facility}
                  </h3>

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    📅 {booking.date}
                  </p>

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    🕒 {booking.time}
                  </p>

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    🎉 {booking.purpose}
                  </p>
                </div>

                <Badge
                  variant={getVariant(
                    booking.status
                  )}
                >
                  {booking.status}
                </Badge>
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            className="w-full"
          >
            View All Bookings
          </Button>
        </div>
      )}
    </Card>
  );
};

export default FacilityBookings;