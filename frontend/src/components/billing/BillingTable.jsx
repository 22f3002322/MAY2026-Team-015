import { Eye, Pencil, Trash2 } from "lucide-react";
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
      header: "Resident / Flat",
      render: (row) => {
        const name = row.resident || "Resident";
        const initial = name.charAt(0).toUpperCase();

        return (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950 font-semibold text-indigo-600 dark:text-indigo-400">
              {initial}
            </div>

            <div>
              <p className="font-medium text-slate-800 dark:text-slate-100">
                {name}
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                {row.flat || `Flat #${row.flat_id || "—"}`}
              </p>
            </div>
          </div>
        );
      },
    },

    {
      key: "billId",
      header: "Bill ID",
      render: (row) => row.billId || `BILL-${row.id}`,
    },

    {
      key: "category",
      header: "Type",
      render: (row) => row.category || "Maintenance",
    },

    {
      key: "amount",
      header: "Amount",
      render: (row) => (
        <span className="font-semibold text-slate-800 dark:text-slate-100">
          ₹{row.amount}
        </span>
      ),
    },

    {
      key: "dueDate",
      header: "Due Date",
      render: (row) => row.dueDate || "N/A",
    },

    {
      key: "paidDate",
      header: "Paid Date",
      render: (row) => row.paidDate || "-",
    },

    {
      key: "status",
      header: "Status",
      render: (row) => {
        const s = String(row.status || "").toLowerCase();
        let variant = "warning";
        let label = "Pending";

        if (s === "paid" || s === "completed") {
          variant = "success";
          label = "Paid";
        } else if (s === "overdue") {
          variant = "danger";
          label = "Overdue";
        }

        return <Badge variant={variant}>{label}</Badge>;
      },
    },

    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          {onView && (
            <Button variant="ghost" size="sm" onClick={() => onView(row)}>
              <Eye size={16} />
            </Button>
          )}

          {onEdit && (
            <Button variant="ghost" size="sm" onClick={() => onEdit(row)}>
              <Pencil size={16} />
            </Button>
          )}

          {onDelete && (
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
      data={bills}
      emptyMessage="No bills found."
    />
  );
};

export default BillingTable;