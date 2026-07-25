import {
  CalendarDays,
  User,
  Home,
  Tag,
  Wrench,
  CheckCircle2,
  Clock3,
  X,
} from "lucide-react";

import Badge from "../ui/Badge";
import Button from "../ui/Button";

const ComplaintDetails = ({
  complaint,
  onClose,
}) => {
  if (!complaint) return null;

  const priorityVariant = {
    Low: "success",
    Medium: "info",
    High: "warning",
    Critical: "danger",
  };

  const statusVariant = {
    Open: "default",
    Assigned: "info",
    "In Progress": "warning",
    Resolved: "success",
    Closed: "secondary",
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">

      <div className="h-full w-full max-w-xl overflow-y-auto bg-white dark:bg-slate-900 shadow-2xl">

        {/* Header */}

        <div className="sticky top-0 flex items-center justify-between border-b bg-white dark:bg-slate-900 px-6 py-5">

          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              Complaint Details
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {complaint.ticket}
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

          {/* Title */}

          <div>

            <h3 className="text-xl font-semibold">
              {complaint.title}
            </h3>

            <p className="mt-2 text-slate-600">
              This complaint has been registered by the resident.
              Backend integration will later replace this placeholder
              with the actual complaint description.
            </p>

          </div>

          {/* Badges */}

          <div className="flex gap-3">

            <Badge
              variant={priorityVariant[complaint.priority]}
            >
              {complaint.priority}
            </Badge>

            <Badge
              variant={statusVariant[complaint.status]}
            >
              {complaint.status}
            </Badge>

          </div>

          {/* Information */}

          <div className="grid grid-cols-2 gap-6">

            <Info
              icon={User}
              label="Resident"
              value={complaint.resident}
            />

            <Info
              icon={Home}
              label="Flat"
              value={complaint.flat}
            />

            <Info
              icon={Tag}
              label="Category"
              value={complaint.category}
            />

            <Info
              icon={CalendarDays}
              label="Created"
              value={complaint.createdAt}
            />

            <Info
              icon={Wrench}
              label="Assigned To"
              value={complaint.assignedTo}
            />

          </div>

          {/* Timeline */}

          <div>

            <h3 className="mb-5 text-lg font-semibold">
              Progress Timeline
            </h3>

            <div className="space-y-5">

              <TimelineItem
                title="Complaint Raised"
                time={complaint.createdAt}
                active
              />

              <TimelineItem
                title="Assigned to Staff"
                time="Pending"
              />

              <TimelineItem
                title="Work In Progress"
                time="Pending"
              />

              <TimelineItem
                title="Resolved"
                time="Pending"
              />

            </div>

          </div>

          {/* Feedback */}

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 p-5">

            <h3 className="font-semibold">
              Resident Feedback
            </h3>

            <p className="mt-3 text-2xl">
              ⭐⭐⭐⭐⭐
            </p>

            <p className="mt-2 text-sm text-slate-600">
              Great service. The issue was resolved quickly.
            </p>

          </div>

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

const TimelineItem = ({
  title,
  time,
  active = false,
}) => (
  <div className="flex gap-4">

    <div className="flex flex-col items-center">

      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full ${
          active
            ? "bg-green-500 text-white"
            : "bg-slate-200 text-slate-500 dark:text-slate-400"
        }`}
      >
        <CheckCircle2 size={16} />
      </div>

      <div className="h-10 w-px bg-slate-300" />

    </div>

    <div>

      <h4 className="font-medium">
        {title}
      </h4>

      <p className="mt-1 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Clock3 size={14} />
        {time}
      </p>

    </div>

  </div>
);

export default ComplaintDetails;