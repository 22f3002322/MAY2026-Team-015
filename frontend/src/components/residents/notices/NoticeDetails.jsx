import {
  CalendarDays,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Hash,
} from "lucide-react";

import Modal from "../../ui/Modal";
import Badge from "../../ui/Badge";

const NoticeDetails = ({ notice, onClose }) => {
  if (!notice) return null;

  const priorityVariant = {
    Urgent: "danger",
    High: "warning",
    Normal: "success",
  };

  const statusVariant = {
    Published: "success",
    Draft: "warning",
    Archived: "default",
  };

  return (
    <Modal open={!!notice} title="Notice Details" onClose={onClose}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {notice.title}
          </h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Notice ID : {notice.noticeId}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Badge variant={priorityVariant[notice.priority] || "default"}>
            <AlertTriangle size={14} />
            {notice.priority}
          </Badge>
          <Badge variant={statusVariant[notice.status] || "default"}>
            <CheckCircle2 size={14} />
            {notice.status}
          </Badge>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="flex items-start gap-3">
            <Hash size={18} className="mt-1 text-indigo-600" />
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Notice ID
              </p>
              <p className="font-medium text-slate-800 dark:text-slate-100">
                {notice.noticeId}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CalendarDays size={18} className="mt-1 text-indigo-600" />
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Publish Date
              </p>
              <p className="font-medium text-slate-800 dark:text-slate-100">
                {notice.publishDate}
              </p>
            </div>
          </div>

          {notice.expiryDate ? (
            <div className="flex items-start gap-3">
              <CalendarDays size={18} className="mt-1 text-indigo-600" />
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Expiry Date
                </p>
                <p className="font-medium text-slate-800 dark:text-slate-100">
                  {notice.expiryDate}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2">
            <FileText size={18} className="text-indigo-600" />
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">
              Description
            </h3>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 leading-7 text-slate-700 dark:border-slate-800">
            {notice.description}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default NoticeDetails;
