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