import {
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Table from "../ui/Table";

const StaffTable = ({
  staff,
  onView,
  onEdit,
  onDelete,
}) => {
  const columns = [
    {
      key: "employeeId",
      header: "Employee ID",
    },
    {
      key: "name",
      header: "Name",
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-800">
            {row.name}
          </p>

          <p className="text-xs text-slate-500">
            {row.designation}
          </p>
        </div>
      ),
    },
    {
      key: "department",
      header: "Department",
    },
    {
      key: "shift",
      header: "Shift",
    },
    {
      key: "phone",
      header: "Phone",
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <Badge
          variant={
            row.status === "Active"
              ? "success"
              : row.status === "On Leave"
              ? "warning"
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
      data={staff}
      emptyMessage="No staff members found."
    />
  );
};

export default StaffTable;