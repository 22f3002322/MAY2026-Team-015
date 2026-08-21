import {
  Building2,
  CalendarDays,
  Clock3,
  BadgeCheck,
  CalendarClock,
  Users,
} from "lucide-react";

import Modal from "../../ui/Modal";
import Badge from "../../ui/Badge";
import { BOOKING_STATUS, labelFor } from "../../../utils/adminMaps";

const statusVariant = {
  booked: "warning",
  approved: "success",
  completed: "secondary",
  cancelled: "danger",
};

const BookingDetails = ({ booking, onClose }) => {
  if (!booking) return null;

  const statusValue = String(
    booking.statusValue || booking.status || ""
  ).toLowerCase();
  const statusLabel =
    labelFor(BOOKING_STATUS, statusValue) || booking.status || statusValue;
  const guests = booking.guest_count ?? booking.guests;

  return (
    <Modal open={!!booking} title="Booking Details" onClose={onClose}>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {booking.facility}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Booking ID : {booking.id}
            </p>
          </div>
          <Badge variant={statusVariant[statusValue] || "default"}>
            <BadgeCheck size={14} />
            {statusLabel}
          </Badge>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="flex items-start gap-3">
            <Building2 size={18} className="mt-1 text-indigo-600" />
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
            <CalendarDays size={18} className="mt-1 text-indigo-600" />
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
            <Clock3 size={18} className="mt-1 text-indigo-600" />
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
            <Users size={18} className="mt-1 text-indigo-600" />
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Guests
              </p>
              <p className="font-medium text-slate-800 dark:text-slate-100">
                {guests != null && guests !== "" ? String(guests) : "—"}
              </p>
            </div>
          </div>

          {booking.createdAt ? (
            <div className="flex items-start gap-3">
              <CalendarClock size={18} className="mt-1 text-indigo-600" />
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Created
                </p>
                <p className="font-medium text-slate-800 dark:text-slate-100">
                  {new Date(booking.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </Modal>
  );
};

export default BookingDetails;
