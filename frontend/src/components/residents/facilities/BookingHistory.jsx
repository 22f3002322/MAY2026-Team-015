import {
  CalendarDays,
  Clock3,
  Eye,
  Trash2,
  Building2,
} from "lucide-react";
import { toast } from "sonner";

import Card from "../../ui/Card";
import Badge from "../../ui/Badge";
import Button from "../../ui/Button";
import useFacilityStore from "../../../store/facilityStore";
import { BOOKING_STATUS, labelFor } from "../../../utils/adminMaps";

const statusVariant = {
  booked: "warning",
  approved: "success",
  completed: "secondary",
  cancelled: "danger",
};

const canCancel = (booking) => {
  const v = String(booking.statusValue || booking.status || "").toLowerCase();
  return v === "booked" || v === "approved";
};

const BookingHistory = ({ bookings, onView }) => {
  const deleteBooking = useFacilityStore((state) => state.deleteBooking);

  if (!bookings || bookings.length === 0) {
    return (
      <Card className="py-16">
        <div className="text-center">
          <Building2 size={48} className="mx-auto text-slate-400" />
          <h3 className="mt-4 text-xl font-semibold text-slate-800 dark:text-slate-100">
            No Bookings Yet
          </h3>
          <p className="mt-2 text-slate-500">
            Your facility bookings will appear here.
          </p>
        </div>
      </Card>
    );
  }

  const handleCancel = async (booking) => {
    const res = await deleteBooking(booking.id);
    if (res?.success) {
      toast.success("Booking cancelled.");
    } else {
      toast.error(res?.message || "Failed to cancel booking.");
    }
  };

  return (
    <div className="space-y-5">
      {bookings.map((booking) => {
        const statusValue = String(
          booking.statusValue || booking.status || ""
        ).toLowerCase();
        const statusLabel =
          labelFor(BOOKING_STATUS, statusValue) || booking.status || statusValue;

        return (
          <Card key={booking.id} className="p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                    {booking.facility}
                  </h2>
                  <Badge variant={statusVariant[statusValue] || "default"}>
                    {statusLabel}
                  </Badge>
                </div>

                <div className="grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                  <div className="flex items-center gap-2 dark:text-slate-100">
                    <CalendarDays size={16} />
                    {booking.date}
                  </div>
                  <div className="flex items-center gap-2 dark:text-slate-100">
                    <Clock3 size={16} />
                    {booking.time}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => onView(booking)}>
                  <Eye size={18} />
                  Details
                </Button>

                {canCancel(booking) && (
                  <Button
                    variant="danger"
                    onClick={() => handleCancel(booking)}
                  >
                    <Trash2 size={18} />
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default BookingHistory;
