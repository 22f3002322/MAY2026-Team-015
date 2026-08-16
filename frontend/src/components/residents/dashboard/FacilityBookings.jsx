import { useMemo } from "react";
import { CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Card from "../../ui/Card";
import Badge from "../../ui/Badge";
import Button from "../../ui/Button";

import useBookingStore from "../../../store/bookingStore";

const getVariant = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "approved" || s === "confirmed") return "success";
  if (s === "pending") return "warning";
  if (s === "rejected" || s === "cancelled" || s === "canceled") return "danger";
  return "default";
};

const FacilityBookings = () => {
  const navigate = useNavigate();
  // bookings from bookingStore which fetches /api/v1/facility-bookings
  const bookings = useBookingStore((state) => state.bookings);

  const upcomingBookings = useMemo(() => {
    return [...bookings]
      .sort(
        (a, b) =>
          new Date(a.booking_date || a.date || 0) -
          new Date(b.booking_date || b.date || 0)
      )
      .slice(0, 5);
  }, [bookings]);

  const getFacilityName = (booking) =>
    booking.facility_name ||
    booking.facility ||
    `Facility #${booking.facility_id}`;

  const getDate = (booking) => {
    const d = booking.booking_date || booking.date;
    if (!d) return "N/A";
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getTime = (booking) => {
    if (booking.time_slot || booking.time) return booking.time_slot || booking.time;
    const start = booking.start_time;
    const end = booking.end_time;
    if (start && end)
      return `${start.slice(0, 5)} – ${end.slice(0, 5)}`;
    return "N/A";
  };

  const getPurpose = (booking) =>
    booking.description || booking.purpose || "—";

  return (
    <Card
      title="Facility Bookings"
      subtitle="Your upcoming bookings"
    >
      {upcomingBookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10">
          <CalendarDays size={42} className="mb-3 text-slate-400" />
          <p className="text-slate-500 dark:text-slate-400">
            No bookings found.
          </p>
          <Button
            className="mt-4"
            onClick={() => navigate("/resident/facilities")}
          >
            Book a Facility
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {upcomingBookings.map((booking) => (
            <div
              key={booking.booking_id || booking.id}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 transition hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-sm"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                    {getFacilityName(booking)}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    📅 {getDate(booking)}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    🕒 {getTime(booking)}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    🎉 {getPurpose(booking)}
                  </p>
                </div>

                <Badge variant={getVariant(booking.status)}>
                  {booking.status || "Pending"}
                </Badge>
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/resident/facilities")}
          >
            View All Bookings
          </Button>
        </div>
      )}
    </Card>
  );
};

export default FacilityBookings;