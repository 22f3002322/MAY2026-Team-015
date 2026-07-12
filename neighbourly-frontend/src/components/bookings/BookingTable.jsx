import {
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

import Table from "../ui/Table";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

const BookingTable = ({
  bookings,
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
            {row.resident?.charAt(0)}
          </div>

          <div>
            <p className="font-medium text-slate-800">
              {row.resident}
            </p>

            <p className="text-xs text-slate-500">
              Flat {row.flat}
            </p>
          </div>
        </div>
      ),
    },

    {
      key: "facility",
      header: "Facility",
    },

    {
      key: "date",
      header: "Booking",
      render: (row) => (
        <div>
          <p className="font-medium">
            {row.date}
          </p>

          <p className="text-xs text-slate-500">
            {row.slot}
          </p>
        </div>
      ),
    },

    {
      key: "guests",
      header: "Guests",
      render: (row) => (
        <span>{row.guests}</span>
      ),
    },

    {
      key: "amount",
      header: "Amount",
      render: (row) => (
        <span className="font-semibold">
          ₹{Number(
            row.amount
          ).toLocaleString()}
        </span>
      ),
    },

    {
      key: "paymentStatus",
      header: "Payment",
      render: (row) => (
        <Badge
          variant={
            row.paymentStatus === "Paid"
              ? "success"
              : row.paymentStatus ===
                "Pending"
              ? "warning"
              : "danger"
          }
        >
          {row.paymentStatus}
        </Badge>
      ),
    },

    {
      key: "status",
      header: "Booking Status",
      render: (row) => (
        <Badge
          variant={
            row.status === "Approved"
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
      data={bookings}
      emptyMessage="No bookings found."
    />
  );
};

export default BookingTable;