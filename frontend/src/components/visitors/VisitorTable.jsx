import {
  Eye,
  Pencil,
  LogIn,
  LogOut,
  Trash2,
} from "lucide-react";

import Table from "../ui/Table";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

const VisitorTable = ({
  visitors,
  onView,
  onEdit,
  onCheck,
  onDelete,
}) => {
  const columns = [
    {
      key: "visitor",
      header: "Visitor",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-600">
            {row.name.charAt(0)}
          </div>

          <div>
            <p className="font-medium text-slate-800 dark:text-slate-100">
              {row.name}
            </p>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              {row.phone}
            </p>
          </div>
        </div>
      ),
    },

    {
      key: "resident",
      header: "Resident",
      render: (row) => (
        <div>
          <p className="font-medium">
            {row.resident}
          </p>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            {row.flat}
          </p>
        </div>
      ),
    },

    {
      key: "purpose",
      header: "Purpose",
    },

    {
      key: "time",
      header: "Visit Time",
      render: (row) => (
        <div>
          <p className="text-sm">
            In : {row.checkIn}
          </p>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Out : {row.checkOut}
          </p>
        </div>
      ),
    },

    {
      key: "status",
      header: "Status",
      render: (row) => (
        <Badge
          variant={
            row.status === "Checked In"
              ? "success"
              : "secondary"
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
          {typeof onView === "function" && (
            <Button variant="ghost" size="sm" onClick={() => onView(row)}>
              <Eye size={16} />
            </Button>
          )}
          {typeof onEdit === "function" && (
            <Button variant="ghost" size="sm" onClick={() => onEdit(row)}>
              <Pencil size={16} />
            </Button>
          )}
          {typeof onCheck === "function" && (
            <Button variant="ghost" size="sm" onClick={() => onCheck(row)}>
              {row.status === "Checked In" ? (
                <LogOut size={16} />
              ) : (
                <LogIn size={16} />
              )}
            </Button>
          )}
          {typeof onDelete === "function" && (
            <Button variant="ghost" size="sm" onClick={() => onDelete(row)}>
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
      data={visitors}
      emptyMessage="No visitors found."
    />
  );
};

export default VisitorTable;