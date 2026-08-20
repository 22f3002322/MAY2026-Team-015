import { useEffect } from "react";
import {
  CalendarDays,
  Building2,
  CheckCircle2,
  Clock,
} from "lucide-react";

import Card from "../ui/Card";
import useBookingStore from "../../store/bookingStore";

const facilityLabel = (b) =>
  b.facility_name ||
  b.facility ||
  (b.facility_id != null ? `Facility #${b.facility_id}` : null);

const BookingStats = () => {
  const bookings = useBookingStore((state) => state.bookings);
  const facilities = useBookingStore((state) => state.facilities);
  const fetchFacilities = useBookingStore((state) => state.fetchFacilities);

  useEffect(() => {
    if (!facilities.length) fetchFacilities();
  }, [facilities.length, fetchFacilities]);

  const totalBookings = bookings.length;

  const activeFacilities = facilities.length
    ? facilities.filter((f) => f.is_active !== false).length
    : new Set(bookings.map(facilityLabel).filter(Boolean)).size;

  const approvedBookings = bookings.filter(
    (booking) => String(booking.status || "").toLowerCase() === "approved"
  ).length;

  const pendingRequests = bookings.filter(
    (booking) => String(booking.status || "").toLowerCase() === "booked"
  ).length;

  const stats = [
    {
      title: "Total Bookings",
      value: totalBookings,
      icon: CalendarDays,
    },
    {
      title: "Active Facilities",
      value: activeFacilities,
      icon: Building2,
    },
    {
      title: "Approved Bookings",
      value: approvedBookings,
      icon: CheckCircle2,
    },
    {
      title: "Pending Requests",
      value: pendingRequests,
      icon: Clock,
    },
  ];

  return (
    <div className="mb-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.title}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {item.title}
                </p>
                <h2 className="mt-3 text-3xl font-bold text-slate-800 dark:text-slate-100">
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

export default BookingStats;