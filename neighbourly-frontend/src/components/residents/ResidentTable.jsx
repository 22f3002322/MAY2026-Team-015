import {
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Table from "../ui/Table";

const ResidentTable = ({
  residents,
}) => {
  const columns = [
    {
      key: "name",
      header: "Resident",
    },
    {
      key: "flat",
      header: "Flat",
    },
    {
      key: "block",
      header: "Block",
    },
    {
      key: "occupancy",
      header: "Occupancy",
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <Badge
          variant={
            row.status === "Active"
              ? "success"
              : "danger"
          }
        >
          {row.status}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: () => (
        <div className="flex gap-2">

          <Button
            variant="ghost"
            size="sm"
          >
            <Eye size={16} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
          >
            <Pencil size={16} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
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
      data={residents}
    />
  );
};

export default ResidentTable;