import { useState } from "react";

import Modal from "../ui/Modal";
import Button from "../ui/Button";

const staffMembers = [
  "John Electrician",
  "Raj Plumber",
  "Maintenance Team",
  "Cleaning Team",
  "Security Team",
];

const AssignStaffModal = ({
  complaint,
  onClose,
}) => {
  const [staff, setStaff] = useState("");
  const [deadline, setDeadline] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState({});

  if (!complaint) return null;

  // Today's date (YYYY-MM-DD)
  const today = new Date().toISOString().split("T")[0];

  const handleAssign = (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!staff) {
      newErrors.staff = "Please select a staff member.";
    }

    if (!deadline) {
      newErrors.deadline = "Please select an expected completion date.";
    } else if (deadline < today) {
      newErrors.deadline =
        "Completion date cannot be before today.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    console.log({
      complaint,
      staff,
      deadline,
      notes,
    });

    onClose();
  };

  return (
    <Modal
      open={!!complaint}
      title="Assign Staff"
      onClose={onClose}
    >
      <form
        onSubmit={handleAssign}
        className="space-y-6"
      >
        {/* Complaint */}

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Complaint
          </label>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200">
              {complaint.ticket}
            </h4>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {complaint.title}
            </p>
          </div>
        </div>

        {/* Staff */}

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Assign Staff
          </label>

          <select
            value={staff}
            onChange={(e) => {
              setStaff(e.target.value);
              setErrors({
                ...errors,
                staff: "",
              });
            }}
            className={`h-14 w-full rounded-xl border px-4 outline-none ${
              errors.staff
                ? "border-red-500"
                : "border-slate-300 dark:border-slate-700 focus:border-indigo-600"
            } bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100`}
          >
            <option value="">
              Select Staff
            </option>

            {staffMembers.map((member) => (
              <option
                key={member}
                value={member}
              >
                {member}
              </option>
            ))}
          </select>

          {errors.staff && (
            <p className="mt-1 text-sm text-red-600">
              {errors.staff}
            </p>
          )}
        </div>

        {/* Deadline */}

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Expected Completion
          </label>

          <input
            type="date"
            min={today}
            value={deadline}
            onChange={(e) => {
              setDeadline(e.target.value);
              setErrors({
                ...errors,
                deadline: "",
              });
            }}
            className={`h-14 w-full rounded-xl border px-4 outline-none ${
              errors.deadline
                ? "border-red-500"
                : "border-slate-300 dark:border-slate-700 focus:border-indigo-600"
            } bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100`}
          />

          {errors.deadline && (
            <p className="mt-1 text-sm text-red-600">
              {errors.deadline}
            </p>
          )}
        </div>

        {/* Notes */}

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Notes
          </label>

          <textarea
            rows={4}
            value={notes}
            onChange={(e) =>
              setNotes(e.target.value)
            }
            placeholder="Assignment notes..."
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-4 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
          />
        </div>

        {/* Buttons */}

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button type="submit">
            Assign Staff
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AssignStaffModal;