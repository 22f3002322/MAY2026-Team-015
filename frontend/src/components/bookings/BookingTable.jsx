import { Eye, Check, Trash2 } from "lucide-react";

import Table from "../ui/Table";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

const BookingTable = ({ bookings, onView, onApprove, onDelete }) => {
  const columns = [
    {
      key: "resident",
      header: "Resident",
      render: (row) => (
        <div>
          <p className="font-medium text-slate-800 dark:text-slate-100">{row.resident}</p>
          <p className="text-xs text-slate-500">{row.flat}</p>
        </div>
      ),
    },
    { key: "facility", header: "Facility" },
    {
      key: "date",
      header: "Date / Time",
      render: (row) => (
        <div>
          <p className="font-medium">{row.date}</p>
          <p className="text-xs text-slate-500">{row.time}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => {
        const s = String(row.status || "").toLowerCase();
        const variant =
          s === "approved" || s === "completed"
            ? "success"
            : s === "booked"
              ? "warning"
              : s === "cancelled"
                ? "danger"
                : "default";
        return <Badge variant={variant}>{row.statusLabel || row.status}</Badge>;
      },
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
          {typeof onApprove === "function" &&
            String(row.status).toLowerCase() === "booked" && (
              <Button variant="ghost" size="sm" onClick={() => onApprove(row)} title="Approve">
                <Check size={16} />
              </Button>
            )}
          {typeof onDelete === "function" &&
            String(row.status).toLowerCase() !== "cancelled" && (
              <Button variant="ghost" size="sm" onClick={() => onDelete(row)} title="Cancel">
                <Trash2 size={16} />
              </Button>
            )}
        </div>
      ),
    },
  ];

  return <Table columns={columns} data={bookings} emptyMessage="No bookings found." />;
};

export default BookingTable;
