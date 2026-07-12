import {
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

import Table from "../ui/Table";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

const PollTable = ({
  polls,
  onView,
  onEdit,
  onDelete,
}) => {
  const getStatusVariant = (status) => {
    switch (status) {
      case "Active":
        return "success";

      case "Upcoming":
        return "warning";

      case "Closed":
        return "secondary";

      default:
        return "default";
    }
  };

  const columns = [
    {
      key: "question",
      header: "Poll",
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-800">
            {row.question}
          </p>

          <p className="text-xs text-slate-500">
            {row.pollId}
          </p>
        </div>
      ),
    },

    {
      key: "category",
      header: "Category",
      render: (row) => (
        <Badge variant="primary">
          {row.category}
        </Badge>
      ),
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
      key: "totalVotes",
      header: "Votes",
      render: (row) => (
        <span className="font-semibold">
          {row.totalVotes ?? 0}
        </span>
      ),
    },

    {
      key: "options",
      header: "Options",
      render: (row) => (
        <span>
          {row.options?.length || 0}
        </span>
      ),
    },

    {
      key: "endDate",
      header: "End Date",
    },

    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(row)}
          >
            <Eye size={16} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(row)}
          >
            <Pencil size={16} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              onDelete(row)
            }
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={polls}
      emptyMessage="No polls found."
    />
  );
};

export default PollTable;