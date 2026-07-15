import {
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Table from "../ui/Table";

const BillingTable = ({
  bills,
  onView,
  onEdit,
  onDelete,
}) => {
  const columns = [
    {
      key: "resident",
      header: "Resident",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-600">
            {row.resident.charAt(0)}
          </div>

          <div>
            <p className="font-medium text-slate-800 dark:text-slate-100">
              {row.resident}
            </p>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              {row.flat}
            </p>
          </div>
        </div>
      ),
    },

    {
      key: "billId",
      header: "Bill ID",
    },

    {
      key: "category",
      header: "Category",
    },

    {
      key: "amount",
      header: "Amount",
      render: (row) => (
        <span className="font-semibold">
          ₹{row.amount}
        </span>
      ),
    },

    {
      key: "dueDate",
      header: "Due Date",
    },

    {
      key: "paidDate",
      header: "Paid Date",
      render: (row) =>
        row.paidDate || "-",
    },

    {
      key: "status",
      header: "Status",
      render: (row) => (
        <Badge
          variant={
            row.status === "Paid"
              ? "success"
              : row.status === "Pending"
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
      data={bills}
      emptyMessage="No bills found."
    />
  );
};

export default BillingTable;