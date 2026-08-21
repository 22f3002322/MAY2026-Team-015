import {
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

import Badge from "../../ui/Badge";
import Table from "../../ui/Table";
import Button from "../../ui/Button";

const ComplaintTable = ({
  complaints,
  onView,
  onEdit,
  onDelete,
}) => {
  const columns = [
    {
      key: "title",
      header: "Title",
    },
    {
      key: "category",
      header: "Category",
    },
    {
      key: "priority",
      header: "Priority",
      render: (row) => {
        let variant = "default";

        switch (row.priority) {
          case "High":
            variant = "danger";
            break;

          case "Medium":
            variant = "warning";
            break;

          case "Low":
            variant = "success";
            break;

          default:
            variant = "default";
        }

        return (
          <Badge variant={variant}>
            {row.priority}
          </Badge>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (row) => {
        let variant = "default";

        switch (row.status) {
          case "Open":
            variant = "danger";
            break;

          case "Assigned":
            variant = "primary";
            break;

          case "In Progress":
            variant = "warning";
            break;

          case "Resolved":
            variant = "success";
            break;

          default:
            variant = "default";
        }

        return (
          <Badge variant={variant}>
            {row.status}
          </Badge>
        );
      },
    },
    {
      key: "createdAt",
      header: "Date",
      render: (row) =>
        row.createdAt
          ? new Date(
              row.createdAt
            ).toLocaleDateString()
          : "-",
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onView(row)}
          >
            <Eye size={16} />
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(row)}
          >
            <Pencil size={16} />
          </Button>

          {typeof onDelete === "function" && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => onDelete(row)}
            >
              <Trash2 size={16} />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={complaints}
    />
  );
};

export default ComplaintTable;