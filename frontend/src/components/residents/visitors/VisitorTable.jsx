import {
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

import Table from "../../ui/Table";
import Badge from "../../ui/Badge";
import Button from "../../ui/Button";

const VisitorTable = ({
  visitors,
  onView,
  onEdit,
  onDelete,
}) => {
  const getStatusVariant = (
    status
  ) => {
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

  const columns = [
    {
      key: "name",
      header: "Visitor",
    },

    {
      key: "phone",
      header: "Phone",
    },

    {
      key: "purpose",
      header: "Purpose",
    },

    {
      key: "date",
      header: "Date",
    },

    {
      key: "visitTime",
      header: "Time",
    },

    {
      key: "status",
      header: "Status",

      render: (row) => (
        <Badge
          variant={getStatusVariant(
            row.status
          )}
        >
          {row.status}
        </Badge>
      ),
    },

    {
      key: "actions",
      header: "Actions",

      render: (row) => (
        <div className="flex items-center gap-2">

          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              onView(row)
            }
          >
            <Eye size={16} />
          </Button>

        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={visitors}
    />
  );
};

export default VisitorTable;