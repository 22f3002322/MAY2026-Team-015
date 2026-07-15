import Modal from "../../ui/Modal";
import Badge from "../../ui/Badge";

const ComplaintDetails = ({
  complaint,
  onClose,
}) => {
  if (!complaint) return null;

  const getVariant = (status) => {
    switch (status) {
      case "Open":
        return "danger";

      case "Assigned":
        return "primary";

      case "In Progress":
        return "warning";

      case "Resolved":
        return "success";

      default:
        return "default";
    }
  };

  const getPriorityVariant = (priority) => {
    switch (priority) {
      case "High":
        return "danger";

      case "Medium":
        return "warning";

      case "Low":
        return "success";

      default:
        return "default";
    }
  };

  return (
    <Modal
      open={!!complaint}
      title="Complaint Details"
      onClose={onClose}
    >
      <div className="space-y-5">

        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            {complaint.title}
          </h3>

          <p className="mt-2 text-slate-600">
            {complaint.description}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">

          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Category
            </p>

            <p className="font-medium">
              {complaint.category}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Priority
            </p>

            <Badge
              variant={getPriorityVariant(
                complaint.priority
              )}
            >
              {complaint.priority}
            </Badge>
          </div>

          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Status
            </p>

            <Badge
              variant={getVariant(
                complaint.status
              )}
            >
              {complaint.status}
            </Badge>
          </div>

          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Created
            </p>

            <p className="font-medium">
              {complaint.createdAt
                ? new Date(
                    complaint.createdAt
                  ).toLocaleString()
                : "-"}
            </p>
          </div>

        </div>
      </div>
    </Modal>
  );
};

export default ComplaintDetails;