import { Eye, Pencil, Trash2 } from "lucide-react";

import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Table from "../ui/Table";

const ApartmentTable = ({
  apartments,
  onView,
  onEdit,
  onDelete,
}) => {
  const columns = [
    {
      key: "flat",
      header: "Flat",
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-800 dark:text-slate-100">
            {row.flat}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Floor {row.floor}
          </p>
        </div>
      ),
    },
    {
      key: "block",
      header: "Block",
    },
    {
      key: "type",
      header: "Type",
    },
    {
      key: "owner",
      header: "Owner",
    },
    {
      key: "occupancy",
      header: "Occupancy",
      render: (row) => (
        <Badge
          variant={
            row.occupancy === "Occupied"
              ? "success"
              : "warning"
          }
        >
          {row.occupancy}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex gap-2">
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
            onClick={() => onDelete(row)}
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
      data={apartments}
      emptyMessage="No apartments found."
    />
  );
};

export default ApartmentTable;