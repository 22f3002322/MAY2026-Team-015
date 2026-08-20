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
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const columns = [
    {
  key: "resident",
  header: "Resident",
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
          {row.email}
        </p>
      </div>
    </div>
  ),
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
      key: "active",
      header: "Active",
      render: (row) => (
        <button
          type="button"
          disabled={!onToggleStatus}
          onClick={() => onToggleStatus && onToggleStatus(row)}
          title={
            row.isActive
              ? "Deactivate account"
              : "Activate account"
          }
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
            row.isActive
              ? "bg-emerald-500"
              : "bg-slate-300 dark:bg-slate-600"
          } ${
            !onToggleStatus
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              row.isActive ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
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
      data={residents}
    />
  );
};

export default ResidentTable;