import {
  User,
  Phone,
  Home,
  Calendar,
  Clock,
  FileText,
  X,
} from "lucide-react";

import Badge from "../ui/Badge";
import Button from "../ui/Button";

const VisitorDetails = ({
  visitor,
  onClose,
}) => {
  if (!visitor) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">

      <div className="h-full w-full max-w-xl overflow-y-auto bg-white dark:bg-slate-900 shadow-2xl">

        {/* Header */}

        <div className="sticky top-0 flex items-center justify-between border-b bg-white dark:bg-slate-900 px-6 py-5">

          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              Visitor Details
            </h2>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              {visitor.visitorId}
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

          {/* Profile */}

          <div className="flex items-center gap-4">

            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-600">
              {visitor.name.charAt(0)}
            </div>

            <div>
              <h3 className="text-xl font-semibold">
                {visitor.name}
              </h3>

              <p className="text-slate-500 dark:text-slate-400">
                {visitor.phone}
              </p>
            </div>

          </div>

          {/* Status */}

          <Badge
            variant={
              visitor.status === "Checked In"
                ? "success"
                : "secondary"
            }
          >
            {visitor.status}
          </Badge>

          {/* Information */}

          <div className="grid grid-cols-2 gap-6">

            <Info
              icon={User}
              label="Resident"
              value={visitor.resident}
            />

            <Info
              icon={Home}
              label="Flat"
              value={visitor.flat}
            />

            <Info
              icon={Phone}
              label="Phone"
              value={visitor.phone}
            />

            <Info
              icon={FileText}
              label="Purpose"
              value={visitor.purpose}
            />

            <Info
              icon={Calendar}
              label="Visit Date"
              value={visitor.date}
            />

            <Info
              icon={Clock}
              label="Entry Time"
              value={visitor.checkIn}
            />

            <Info
              icon={Clock}
              label="Exit Time"
              value={visitor.checkOut}
            />

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
        {value}
      </p>
    </div>

  </div>
);

export default VisitorDetails;