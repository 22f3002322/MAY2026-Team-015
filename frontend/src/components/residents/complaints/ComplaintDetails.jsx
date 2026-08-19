import Modal from "../../ui/Modal";
import Badge from "../../ui/Badge";
import { mediaUrl } from "../../../utils/mediaUrl";

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
              {complaint.createdAt || complaint.created_at
                ? new Date(
                    complaint.createdAt || complaint.created_at
                  ).toLocaleString()
                : "-"}
            </p>
          </div>

        </div>

        {/* Attached Images */}
        {((complaint.images && complaint.images.length > 0) || (complaint.image_urls && complaint.image_urls.length > 0)) && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Attached Images
            </p>
            <div className="grid grid-cols-2 gap-3">
              {(complaint.images || complaint.image_urls || []).map((img, idx) => (
                <img
                  key={idx}
                  src={mediaUrl(typeof img === "string" ? img : (img.url || img.image_url))}
                  alt={`Attachment ${idx + 1}`}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 object-cover w-full h-36"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ComplaintDetails;