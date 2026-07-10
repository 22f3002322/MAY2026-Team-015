import {
  Receipt,
  User,
  Home,
  Calendar,
  IndianRupee,
  FileText,
  CheckCircle2,
  X,
} from "lucide-react";

import Badge from "../ui/Badge";
import Button from "../ui/Button";

const BillDetails = ({
  bill,
  onClose,
}) => {
  if (!bill) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">

      <div className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">

        {/* Header */}

        <div className="sticky top-0 flex items-center justify-between border-b bg-white px-6 py-5">

          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Bill Details
            </h2>

            <p className="text-sm text-slate-500">
              {bill.billId}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            <X size={20} />
          </button>

        </div>

        {/* Body */}

        <div className="space-y-8 p-6">

          {/* Resident */}

          <div className="flex items-center gap-4">

            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-600">
              {bill.resident.charAt(0)}
            </div>

            <div>
              <h3 className="text-xl font-semibold">
                {bill.resident}
              </h3>

              <p className="text-slate-500">
                Flat {bill.flat}
              </p>
            </div>

          </div>

          {/* Status */}

          <Badge
            variant={
              bill.status === "Paid"
                ? "success"
                : bill.status === "Pending"
                ? "warning"
                : "danger"
            }
          >
            {bill.status}
          </Badge>

          {/* Information */}

          <div className="grid grid-cols-2 gap-6">

            <Info
              icon={Receipt}
              label="Bill ID"
              value={bill.billId}
            />

            <Info
              icon={FileText}
              label="Category"
              value={bill.category}
            />

            <Info
              icon={IndianRupee}
              label="Amount"
              value={`₹${bill.amount}`}
            />

            <Info
              icon={Calendar}
              label="Due Date"
              value={bill.dueDate}
            />

            <Info
              icon={CheckCircle2}
              label="Paid Date"
              value={
                bill.paidDate || "Not Paid"
              }
            />

            <Info
              icon={Home}
              label="Flat"
              value={bill.flat}
            />

          </div>

          {/* Description */}

          <div>
            <h4 className="mb-2 font-semibold text-slate-800">
              Description
            </h4>

            <div className="rounded-xl border bg-slate-50 p-4 text-slate-600">
              {bill.description ||
                "No description available."}
            </div>
          </div>

          {/* Footer */}

          <Button
            variant="outline"
            className="w-full"
            onClick={onClose}
          >
            Close
          </Button>

        </div>

      </div>

    </div>
  );
};

const Info = ({
  icon: Icon,
  label,
  value,
}) => (
  <div className="flex gap-3">

    <div className="mt-1 text-indigo-600">
      <Icon size={18} />
    </div>

    <div>
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="font-medium text-slate-800">
        {value}
      </p>
    </div>

  </div>
);

export default BillDetails;