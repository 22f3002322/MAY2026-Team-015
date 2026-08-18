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

const formatTs = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const statusRank = {
  open: 0,
  assigned: 1,
  in_progress: 2,
  resolved: 3,
  closed: 3,
};

const buildTimeline = (complaint) => {
  const raw =
    complaint.statusValue ||
    String(complaint.status || "open")
      .toLowerCase()
      .replace(/\s+/g, "_");
  const rank = statusRank[raw] ?? 0;

  const assignments = complaint.assignments || [];
  const tasks = complaint.tasks || [];

  const latestAssignment = [...assignments].sort(
    (a, b) => new Date(b.assigned_at || 0) - new Date(a.assigned_at || 0)
  )[0];

  const latestStarted = [...tasks]
    .filter((t) => t.started_at)
    .sort((a, b) => new Date(b.started_at) - new Date(a.started_at))[0];

  return [
    {
      title: "Complaint Raised",
      time: complaint.createdAt || formatTs(complaint.created_at) || "—",
      active: true,
    },
    {
      title: "Assigned to Staff",
      time:
        rank >= 1
          ? formatTs(latestAssignment?.assigned_at) || complaint.createdAt || "Done"
          : "Pending",
      active: rank >= 1,
    },
    {
      title: "Work In Progress",
      time:
        rank >= 2
          ? formatTs(latestStarted?.started_at) ||
            formatTs(complaint.updated_at) ||
            "In progress"
          : "Pending",
      active: rank >= 2,
    },
    {
      title: "Resolved",
      time:
        rank >= 3
          ? formatTs(complaint.resolved_at) || formatTs(complaint.closed_at) || "Done"
          : "Pending",
      active: rank >= 3,
    },
  ];
};

const ComplaintDetails = ({ complaint, onClose }) => {
  if (!complaint) return null;

  const priorityVariant = {
    Low: "success",
    Medium: "info",
    High: "warning",
    Urgent: "danger",
    Critical: "danger",
  };

  const statusVariant = {
    Open: "default",
    Assigned: "info",
    "In Progress": "warning",
    Resolved: "success",
    Closed: "secondary",
  };

  const timeline = buildTimeline(complaint);
  const comments = Array.isArray(complaint.comments) ? complaint.comments : [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
      <div className="h-full w-full max-w-xl overflow-y-auto bg-white dark:bg-slate-900 shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b bg-white dark:bg-slate-900 px-6 py-5">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              Complaint Details
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {complaint.ticket}
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-8 p-6">
          <div>
            <h3 className="text-xl font-semibold">{complaint.title}</h3>
            <p className="mt-2 whitespace-pre-wrap text-slate-600 dark:text-slate-300">
              {complaint.description || "No description provided."}
            </p>
          </div>

          <div className="flex gap-3">
            <Badge variant={priorityVariant[complaint.priority] || "default"}>
              {complaint.priority}
            </Badge>
            <Badge variant={statusVariant[complaint.status] || "default"}>
              {complaint.status}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Info icon={User} label="Resident" value={complaint.resident || "—"} />
            <Info icon={Home} label="Flat" value={complaint.flat || "—"} />
            <Info icon={Tag} label="Category" value={complaint.category || "—"} />
            <Info icon={CalendarDays} label="Created" value={complaint.createdAt || "—"} />
            <Info
              icon={Wrench}
              label="Assigned To"
              value={complaint.assignedTo || "Unassigned"}
            />
          </div>

          <div>
            <h3 className="mb-5 text-lg font-semibold">Progress Timeline</h3>
            <div className="space-y-5">
              {timeline.map((step) => (
                <TimelineItem
                  key={step.title}
                  title={step.title}
                  time={step.time}
                  active={step.active}
                />
              ))}
            </div>
          </div>

          {comments.length > 0 && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-5">
              <h3 className="font-semibold">Resident Feedback</h3>
              <div className="mt-4 space-y-4">
                {comments.map((c) => (
                  <div key={c.comment_id || `${c.user_id}-${c.created_at}`}>
                    {c.rating != null && (
                      <p className="text-lg" aria-label={`Rating ${c.rating} of 5`}>
                        {"★".repeat(c.rating)}
                        {"☆".repeat(Math.max(0, 5 - c.rating))}
                      </p>
                    )}
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      {c.feedback}
                    </p>
                    {c.created_at && (
                      <p className="mt-1 text-xs text-slate-400">{formatTs(c.created_at)}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button variant="outline" className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

const Info = ({ icon: Icon, label, value }) => (
  <div className="flex gap-3">
    <div className="mt-1 text-indigo-600">
      <Icon size={18} />
    </div>
    <div>
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="font-medium text-slate-800 dark:text-slate-100">{value}</p>
    </div>
  </div>
);

const TimelineItem = ({ title, time, active = false }) => (
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
      <h4 className="font-medium">{title}</h4>
      <p className="mt-1 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Clock3 size={14} />
        {time}
      </p>
    </div>
  </div>
);

export default ComplaintDetails;
