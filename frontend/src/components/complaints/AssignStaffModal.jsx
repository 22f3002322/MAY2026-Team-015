import { useEffect, useState } from "react";
import { toast } from "sonner";

import Modal from "../ui/Modal";
import Button from "../ui/Button";
import maintenanceApi from "../../api/maintenanceApi";
import useComplaintStore from "../../store/complaintStore";

const AssignStaffModal = ({ complaint, onClose }) => {
  const assignComplaint = useComplaintStore((s) => s.assignComplaint);
  const [staffList, setStaffList] = useState([]);
  const [staffId, setStaffId] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!complaint) return;
    setStaffId("");
    setErrors({});
    (async () => {
      try {
        const res = await maintenanceApi.getStaffDirectory({ is_available: true });
        if (res?.success && Array.isArray(res.data)) {
          setStaffList(res.data);
        }
      } catch (err) {
        console.warn("Staff directory fetch failed:", err.message);
      }
    })();
  }, [complaint]);

  if (!complaint) return null;

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!staffId) {
      setErrors({ staff: "Please select a staff member." });
      return;
    }
    setLoading(true);
    const res = await assignComplaint(complaint.id || complaint.complaint_id, Number(staffId));
    setLoading(false);
    if (res.success) {
      toast.success(res.message || "Staff assigned.");
      onClose();
    } else {
      toast.error(res.message || "Assignment failed.");
    }
  };

  return (
    <Modal open={!!complaint} title="Assign Staff" onClose={onClose}>
      <form onSubmit={handleAssign} className="space-y-6">
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

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Assign Staff
          </label>
          <select
            value={staffId}
            onChange={(e) => {
              setStaffId(e.target.value);
              setErrors({});
            }}
            className="h-14 w-full rounded-xl border border-slate-300 dark:border-slate-700 px-4"
          >
            <option value="">Select staff…</option>
            {staffList.map((s) => (
              <option key={s.staff_id} value={s.staff_id}>
                {s.full_name || s.email}
                {s.specialization ? ` — ${s.specialization}` : ""}
                {` (${s.active_task_count} active)`}
              </option>
            ))}
          </select>
          {errors.staff && (
            <p className="mt-1 text-sm text-red-500">{errors.staff}</p>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Assigning…" : "Assign"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AssignStaffModal;
