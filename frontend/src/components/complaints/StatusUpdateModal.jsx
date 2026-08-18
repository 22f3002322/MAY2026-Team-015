import { useState } from "react";

import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { COMPLAINT_STATUS } from "../../utils/adminMaps";

const StatusUpdateModal = ({ complaint, onClose, onUpdate }) => {
  const [status, setStatus] = useState(complaint?.statusValue || "assigned");
  const [errors, setErrors] = useState({});

  if (!complaint) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!status) {
      setErrors({ status: "Please select a status." });
      return;
    }
    setErrors({});
    onUpdate?.({ status });
  };

  return (
    <Modal open={!!complaint} title="Update Complaint Status" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Complaint
          </label>
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200">
              {complaint.ticket}
            </h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {complaint.title}
            </p>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-14 w-full rounded-xl border border-slate-300 dark:border-slate-700 px-4"
          >
            {COMPLAINT_STATUS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {errors.status && (
            <p className="mt-1 text-sm text-red-500">{errors.status}</p>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Update Status</Button>
        </div>
      </form>
    </Modal>
  );
};

export default StatusUpdateModal;
