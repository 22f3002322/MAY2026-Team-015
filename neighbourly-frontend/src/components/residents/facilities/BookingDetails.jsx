import {
  Building2,
  CalendarDays,
  Clock3,
  FileText,
  BadgeCheck,
  CalendarClock,
} from "lucide-react";

import Modal from "../../ui/Modal";
import Badge from "../../ui/Badge";

const BookingDetails = ({
  booking,
  onClose,
}) => {
  if (!booking) return null;

  const statusVariant = {
    Approved: "success",
    Pending: "warning",
    Rejected: "danger",
  };

  return (
    <Modal
      open={!!booking}
      title="Booking Details"
      onClose={onClose}
    >
      <div className="space-y-6">

        {/* Header */}

        <div className="flex items-start justify-between gap-4">

          <div>

            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {booking.facility}
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Booking ID : {booking.id}
            </p>

          </div>

          <Badge
            variant={
              statusVariant[
                booking.status
              ] || "default"
            }
          >
            <BadgeCheck size={14} />
            {booking.status}
          </Badge>

        </div>

        {/* Information */}

        <div className="grid gap-5 md:grid-cols-2">

          <div className="flex items-start gap-3">

            <Building2
              size={18}
              className="mt-1 text-indigo-600"
            />

            <div>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Facility
              </p>

              <p className="font-medium text-slate-800 dark:text-slate-100">
                {booking.facility}
              </p>

            </div>

          </div>

          <div className="flex items-start gap-3">

            <CalendarDays
              size={18}
              className="mt-1 text-indigo-600"
            />

            <div>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Booking Date
              </p>

              <p className="font-medium text-slate-800 dark:text-slate-100">
                {booking.date}
              </p>

            </div>

          </div>

          <div className="flex items-start gap-3">

            <Clock3
              size={18}
              className="mt-1 text-indigo-600"
            />

            <div>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Time Slot
              </p>

              <p className="font-medium text-slate-800 dark:text-slate-100">
                {booking.time}
              </p>

            </div>

          </div>

          <div className="flex items-start gap-3">

            <CalendarClock
              size={18}
              className="mt-1 text-indigo-600"
            />

            <div>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Created
              </p>

              <p className="font-medium text-slate-800 dark:text-slate-100">
                {new Date(
                  booking.createdAt
                ).toLocaleString()}
              </p>

            </div>

          </div>

          {booking.updatedAt && (
            <div className="flex items-start gap-3 md:col-span-2">

              <CalendarClock
                size={18}
                className="mt-1 text-indigo-600"
              />

              <div>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Last Updated
                </p>

                <p className="font-medium text-slate-800 dark:text-slate-100">
                  {new Date(
                    booking.updatedAt
                  ).toLocaleString()}
                </p>

              </div>

            </div>
          )}

        </div>

        {/* Purpose */}

        <div>

          <div className="mb-3 flex items-center gap-2">

            <FileText
              size={18}
              className="text-indigo-600"
            />

            <h3 className="font-semibold text-slate-800 dark:text-slate-100">
              Purpose
            </h3>

          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 p-4 leading-7 text-slate-700">
            {booking.purpose}
          </div>

        </div>

      </div>
    </Modal>
  );
};

export default BookingDetails;