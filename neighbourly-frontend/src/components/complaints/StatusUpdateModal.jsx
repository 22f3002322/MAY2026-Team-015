import { useState } from "react";

import Modal from "../ui/Modal";
import Button from "../ui/Button";

const statusOptions = [
  "Assigned",
  "In Progress",
  "Resolved",
  "Closed",
];

const StatusUpdateModal = ({
  complaint,
  onClose,
  onUpdate,
}) => {
  const [status, setStatus] = useState(
    complaint?.status || "Assigned"
  );

  const [remarks, setRemarks] = useState("");

  const [errors, setErrors] = useState({});

  if (!complaint) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!status) {
      newErrors.status = "Please select a status.";
    }

    if (!remarks.trim()) {
      newErrors.remarks =
        "Please enter progress remarks.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    if (onUpdate) {
      onUpdate({ status, remarks });
    } else {
      onClose();
    }
  };

  return (
    <Modal
      open={!!complaint}
      title="Update Complaint Status"
      onClose={onClose}
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
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
            onChange={(e) => {
              setStatus(e.target.value);
              setErrors({
                ...errors,
                status: "",
              });
            }}
            className={`h-14 w-full rounded-xl border px-4 ${
              errors.status
                ? "border-red-500"
                : "border-slate-300 dark:border-slate-700"
            } bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600`}
          >
            {statusOptions.map((item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            ))}
          </select>

          {errors.status && (
            <p className="mt-1 text-sm text-red-600">
              {errors.status}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Progress Remarks
          </label>

          <textarea
            rows={5}
            value={remarks}
            onChange={(e) => {
              setRemarks(e.target.value);
              setErrors({
                ...errors,
                remarks: "",
              });
            }}
            placeholder="Describe the latest progress..."
            className={`w-full rounded-xl border p-4 ${
              errors.remarks
                ? "border-red-500"
                : "border-slate-300 dark:border-slate-700"
            } bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600`}
          />

          {errors.remarks && (
            <p className="mt-1 text-sm text-red-600">
              {errors.remarks}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button type="submit">
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default StatusUpdateModal;