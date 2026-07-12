import Modal from "../ui/Modal";
import Badge from "../ui/Badge";

const StaffDetails = ({
  staff,
  onClose,
}) => {
  if (!staff) return null;

  return (
    <Modal
      open={!!staff}
      title="Staff Details"
      onClose={onClose}
    >
      <div className="space-y-6">

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-xl font-bold text-slate-800">
                {staff.name}
              </h2>

              <p className="mt-1 text-slate-500">
                {staff.designation}
              </p>
            </div>

            <Badge
              variant={
                staff.status === "Active"
                  ? "success"
                  : staff.status === "On Leave"
                  ? "warning"
                  : "danger"
              }
            >
              {staff.status}
            </Badge>

          </div>

        </div>

        <div className="grid gap-4 md:grid-cols-2">

          <Info
            label="Employee ID"
            value={staff.employeeId}
          />

          <Info
            label="Department"
            value={staff.department}
          />

          <Info
            label="Phone"
            value={staff.phone}
          />

          <Info
            label="Email"
            value={staff.email}
          />

          <Info
            label="Shift"
            value={staff.shift}
          />

          <Info
            label="Joining Date"
            value={staff.joiningDate}
          />

          <Info
            label="Salary"
            value={`₹${Number(
              staff.salary
            ).toLocaleString("en-IN")}`}
          />

        </div>

      </div>
    </Modal>
  );
};

const Info = ({
  label,
  value,
}) => (
  <div className="rounded-xl border border-slate-200 p-4">
    <p className="text-xs uppercase tracking-wide text-slate-500">
      {label}
    </p>

    <p className="mt-1 font-semibold text-slate-800">
      {value || "-"}
    </p>
  </div>
);

export default StaffDetails;