import {
  CalendarDays,
  Building2,
  IndianRupee,
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

  const totalBookings = bookings.length;

  const activeFacilities = new Set(
    bookings.map(facilityLabel).filter(Boolean)
  ).size;

  const totalRevenue = bookings.reduce(
    (sum, booking) => sum + (Number(booking.amount) || 0),
    0
  );

  const pendingRequests = bookings.filter((booking) => {
    const s = String(booking.status || "").toLowerCase();
    return s === "booked" || s === "pending";
  }).length;

  const stats = [
    {
      title: "Total Bookings",
      value: totalBookings,
      change: "",
      trend: "up",
      icon: CalendarDays,
    },
    {
      title: "Active Facilities",
      value: activeFacilities,
      change: "",
      trend: "up",
      icon: Building2,
    },
    {
      title: "Revenue",
      value: `₹${totalRevenue.toLocaleString()}`,
      change: "",
      trend: "up",
      icon: IndianRupee,
    },
    {
      title: "Pending Requests",
      value: pendingRequests,
      change: "",
      trend: pendingRequests > 0 ? "down" : "up",
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
                <p
                  className={`mt-2 text-sm font-medium ${
                    item.trend === "up" ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  Live Data
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
