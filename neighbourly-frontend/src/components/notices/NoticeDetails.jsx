import {
  Bell,
  Calendar,
  User,
  Tag,
  AlertTriangle,
  FileText,
  X,
} from "lucide-react";

import Badge from "../ui/Badge";
import Button from "../ui/Button";

const NoticeDetails = ({
  notice,
  onClose,
}) => {
  if (!notice) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">

      <div className="h-full w-full max-w-xl overflow-y-auto bg-white dark:bg-slate-900 shadow-2xl">

        {/* Header */}

        <div className="sticky top-0 flex items-center justify-between border-b bg-white dark:bg-slate-900 px-6 py-5">

          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              Notice Details
            </h2>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              {notice.noticeId}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 transition hover:bg-slate-100"
          >
            <X size={20} />
          </button>

        </div>

        {/* Body */}

        <div className="space-y-8 p-6">

          {/* Notice Icon */}

          <div className="flex items-center gap-4">

            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
              <Bell size={30} />
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
                {notice.title}
              </h3>

              <p className="text-slate-500 dark:text-slate-400">
                {notice.category}
              </p>
            </div>

          </div>

          {/* Badges */}

          <div className="flex flex-wrap gap-3">

            <Badge
              variant={
                notice.priority === "High"
                  ? "danger"
                  : notice.priority === "Medium"
                  ? "warning"
                  : "success"
              }
            >
              {notice.priority}
            </Badge>

            <Badge
              variant={
                notice.status === "Published"
                  ? "success"
                  : "secondary"
              }
            >
              {notice.status}
            </Badge>

          </div>

          {/* Information Grid */}

          <div className="grid grid-cols-2 gap-6">

            <Info
              icon={FileText}
              label="Notice ID"
              value={notice.noticeId}
            />

            <Info
              icon={Tag}
              label="Category"
              value={notice.category}
            />

            <Info
              icon={User}
              label="Author"
              value={notice.author}
            />

            <Info
              icon={AlertTriangle}
              label="Priority"
              value={notice.priority}
            />

            <Info
              icon={Calendar}
              label="Publish Date"
              value={notice.publishDate}
            />

            <Info
              icon={Calendar}
              label="Expiry Date"
              value={notice.expiryDate}
            />

          </div>

          {/* Description */}

          <div>

            <h4 className="mb-3 text-lg font-semibold text-slate-800 dark:text-slate-100">
              Description
            </h4>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 p-5 leading-7 text-slate-600">
              {notice.description}
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
        {value}
      </p>
    </div>

  </div>
);

export default NoticeDetails;