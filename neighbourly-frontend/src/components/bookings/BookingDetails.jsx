import {
  Calendar,
  Clock,
  Home,
  IndianRupee,
  Users,
  FileText,
  CreditCard,
  CheckCircle2,
  X,
} from "lucide-react";

import Badge from "../ui/Badge";
import Button from "../ui/Button";

const BookingDetails = ({
  booking,
  onClose,
}) => {
  if (!booking) return null;

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
      <div className="h-full w-full max-w-xl overflow-y-auto bg-white dark:bg-slate-900 shadow-2xl">
        {/* Header */}

        <div className="sticky top-0 flex items-center justify-between border-b bg-white dark:bg-slate-900 px-6 py-5">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              Booking Details
            </h2>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              {booking.bookingId}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}

        <div className="space-y-8 p-6">
          {/* Resident */}

          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-600">
              {booking.resident?.charAt(0)}
            </div>

            <div>
              <h3 className="text-xl font-semibold">
                {booking.resident}
              </h3>

              <p className="text-slate-500 dark:text-slate-400">
                Flat {booking.flat}
              </p>
            </div>
          </div>

          {/* Status */}

          <div className="flex flex-wrap gap-3">
            <Badge
              variant={
                booking.status === "Approved"
                  ? "success"
                  : booking.status ===
                    "Pending"
                  ? "warning"
                  : "danger"
              }
            >
              {booking.status}
            </Badge>

            <Badge
              variant={
                booking.paymentStatus ===
                "Paid"
                  ? "success"
                  : booking.paymentStatus ===
                    "Pending"
                  ? "warning"
                  : "danger"
              }
            >
              {booking.paymentStatus}
            </Badge>
          </div>

          {/* Information */}

          <div className="grid grid-cols-2 gap-6">
            <Info
              icon={Home}
              label="Facility"
              value={booking.facility}
            />

            <Info
              icon={Calendar}
              label="Booking Date"
              value={booking.date}
            />

            <Info
              icon={Clock}
              label="Time Slot"
              value={booking.slot}
            />

            <Info
              icon={Users}
              label="Guests"
              value={booking.guests}
            />

            <Info
              icon={IndianRupee}
              label="Amount"
              value={`₹${Number(
                booking.amount
              ).toLocaleString()}`}
            />

            <Info
              icon={CreditCard}
              label="Payment"
              value={
                booking.paymentStatus
              }
            />

            <Info
              icon={FileText}
              label="Booking ID"
              value={booking.bookingId}
            />

            <Info
              icon={CheckCircle2}
              label="Created"
              value={formatDate(
                booking.createdAt
              )}
            />

            <Info
              icon={Calendar}
              label="Last Updated"
              value={formatDate(
                booking.updatedAt
              )}
            />
          </div>

          {/* Notes */}

          <div>
            <h4 className="mb-2 font-semibold text-slate-800 dark:text-slate-100">
              Notes
            </h4>

            <div className="rounded-xl border bg-slate-50 p-4 text-slate-600">
              {booking.notes ||
                "No notes available."}
            </div>
          </div>

          {/* Footer */}

          <Button
            variant="outline"
            className="w-full"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

const Info = ({
  icon: Icon,
  label,
  value,
}) => (
  <div className="flex gap-3">
    <div className="mt-1 text-indigo-600">
      <Icon size={18} />
    </div>

    <div>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {label}
      </p>

      <p className="font-medium text-slate-800 dark:text-slate-100">
        {value || "-"}
      </p>
    </div>
  </div>
);

export default BookingDetails;