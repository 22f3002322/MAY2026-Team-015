import {
  Home,
  ClipboardList,
  CreditCard,
  CalendarCheck,
} from "lucide-react";

import { useMemo } from "react";
import Card from "../../ui/Card";

import useAuthStore from "../../../store/authStore";
import useComplaintStore from "../../../store/complaintStore";
import useBillingStore from "../../../store/billingStore";
import useBookingStore from "../../../store/bookingStore";

const ResidentStats = () => {
  const user = useAuthStore((state) => state.user);

  const complaints = useComplaintStore((state) => state.complaints);
  // Resident sees their own bills via myBills (from fetchMyBills)
  const myBills = useBillingStore((state) => state.myBills);
  const bookings = useBookingStore((state) => state.bookings);

  const stats = useMemo(() => {
    const pendingBills = myBills.filter(
      (bill) => String(bill.status || "").toLowerCase() === "unpaid"
    );

    const upcomingBookings = bookings.filter((b) => {
      const status = String(b.status || "").toLowerCase();
      return status === "booked" || status === "approved";
    });

    return [
      {
        title: "My Apartment",
        value: user?.flat || "--",
        subtitle: user?.block ? `Block ${user.block}` : "Resident",
        icon: Home,
      },
      {
        title: "My Complaints",
        value: complaints.length,
        subtitle: "Total Raised",
        icon: ClipboardList,
      },
      {
        title: "Pending Bills",
        value: pendingBills.length,
        subtitle: "Awaiting Payment",
        icon: CreditCard,
      },
      {
        title: "Facility Bookings",
        value: upcomingBookings.length,
        subtitle: "Active Bookings",
        icon: CalendarCheck,
      },
    ];
  }, [user, complaints, myBills, bookings]);

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <Card
            key={item.title}
            className="transition-all hover:shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {item.title}
                </p>

                <h2 className="mt-3 text-3xl font-bold text-slate-800 dark:text-slate-100">
                  {item.value}
                </h2>

                <p className="mt-2 text-sm text-indigo-600">
                  {item.subtitle}
                </p>
              </div>

              <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                <Icon size={24} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default ResidentStats;