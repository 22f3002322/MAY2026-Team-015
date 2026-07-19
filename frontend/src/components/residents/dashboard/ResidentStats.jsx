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
import useFacilityStore from "../../../store/facilityStore";

const ResidentStats = () => {
  // Use logged-in user from authStore
  const user = useAuthStore((state) => state.user);

  const complaints = useComplaintStore(
    (state) => state.complaints
  );

  const bills = useBillingStore(
    (state) => state.bills
  );

  const bookings = useFacilityStore(
    (state) => state.bookings || []
  );

  const stats = useMemo(() => {
    const myComplaints = complaints.filter(
      (c) => c.flat === user?.flat
    );

    const pendingBills = bills.filter(
      (bill) =>
        bill.flat === user?.flat &&
        bill.status === "Pending"
    );

    const myBookings = bookings.filter(
      (booking) => booking.flat === user?.flat
    );

    return [
      {
        title: "My Apartment",
        value: user?.flat || "--",
        subtitle: user?.occupancy || "",
        icon: Home,
      },
      {
        title: "My Complaints",
        value: myComplaints.length,
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
        value: myBookings.length,
        subtitle: "Active Bookings",
        icon: CalendarCheck,
      },
    ];
  }, [
    user,
    complaints,
    bills,
    bookings,
  ]);

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

export default ResidentStats;