import Modal from "../../ui/Modal";
import Badge from "../../ui/Badge";

const VisitorDetails = ({
  visitor,
  onClose,
}) => {
  if (!visitor) return null;

  const getVariant = (status) => {
    switch (status) {
      case "Expected":
        return "warning";

      case "Checked In":
        return "primary";

      case "Completed":
        return "success";

      case "Cancelled":
        return "danger";

      default:
        return "default";
    }
  };

  return (
    <Modal
      open={!!visitor}
      title="Visitor Details"
      onClose={onClose}
    >
      <div className="space-y-6">

        {/* Visitor Information */}

        <div className="grid gap-5 md:grid-cols-2">

          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Visitor Name
            </p>

            <p className="font-semibold">
              {visitor.name}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Phone Number
            </p>

            <p className="font-semibold">
              {visitor.phone}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Purpose
            </p>

            <p className="font-semibold">
              {visitor.purpose}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Visit Date
            </p>

            <p className="font-semibold">
              {visitor.date}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Visit Time
            </p>

            <p className="font-semibold">
              {visitor.visitTime}
            </p>
          </div>

          <div>
            <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
              Status
            </p>

            <Badge
              variant={getVariant(
                visitor.status
              )}
            >
              {visitor.status}
            </Badge>
          </div>

          {visitor.otp && (
            <div className="col-span-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 p-4 border border-indigo-100 dark:border-indigo-900 flex flex-col items-center justify-center">
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold tracking-wider uppercase">
                Visitor Verification OTP
              </p>
              <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-300 mt-1 tracking-widest">
                {visitor.otp}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 text-center">
                Share this OTP with the visitor to verify entry at the gate.
              </p>
            </div>
          )}

        </div>

        {/* Created */}

        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Request Created
          </p>

          <p className="font-semibold">
            {visitor.createdAt
              ? new Date(
                  visitor.createdAt
                ).toLocaleString()
              : "-"}
          </p>
        </div>

      </div>
    </Modal>
  );
};

export default VisitorDetails;