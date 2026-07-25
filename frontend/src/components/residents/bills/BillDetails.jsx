import Modal from "../../ui/Modal";
import Badge from "../../ui/Badge";

const BillDetails = ({
  bill,
  onClose,
}) => {
  if (!bill) return null;

  return (
    <Modal
      open={!!bill}
      title="Bill Details"
      onClose={onClose}
    >
      <div className="space-y-6">

        {/* Bill Info */}

        <div className="grid gap-5 md:grid-cols-2">

          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Bill ID
            </p>

            <p className="font-semibold">
              {bill.billId}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Category
            </p>

            <p className="font-semibold">
              {bill.category}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Resident
            </p>

            <p className="font-semibold">
              {bill.resident}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Flat
            </p>

            <p className="font-semibold">
              {bill.flat}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Amount
            </p>

            <p className="text-xl font-bold text-indigo-600">
              ₹{Number(
                bill.amount || 0
              ).toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Due Date
            </p>

            <p className="font-semibold">
              {bill.dueDate}
            </p>
          </div>

        </div>

        {/* Status */}

        <div className="grid gap-5 md:grid-cols-2">

          <div>
            <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
              Status
            </p>

            <Badge
              variant={
                bill.status === "Paid"
                  ? "success"
                  : "warning"
              }
            >
              {bill.status}
            </Badge>
          </div>

          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Payment Method
            </p>

            <p className="font-semibold">
              {bill.paymentMethod ||
                "-"}
            </p>
          </div>

        </div>

        {/* Dates */}

        <div className="grid gap-5 md:grid-cols-2">

          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Paid Date
            </p>

            <p className="font-semibold">
              {bill.paidDate || "-"}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Created
            </p>

            <p className="font-semibold">
              {bill.createdAt
                ? new Date(
                    bill.createdAt
                  ).toLocaleString()
                : "-"}
            </p>
          </div>

        </div>

        {/* Remarks */}

        <div>
          <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
            Remarks
          </p>

          <div className="rounded-xl bg-slate-50 dark:bg-slate-900 p-4">
            {bill.remarks ||
              "No remarks available."}
          </div>
        </div>

      </div>
    </Modal>
  );
};

export default BillDetails;