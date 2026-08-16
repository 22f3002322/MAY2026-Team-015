import { useMemo, useState } from "react";
import { CreditCard } from "lucide-react";
import { toast } from "sonner";

import Card from "../../ui/Card";
import Button from "../../ui/Button";
import Badge from "../../ui/Badge";
import Modal from "../../ui/Modal";

import useBillingStore from "../../../store/billingStore";

const UpcomingBills = () => {
  // Resident's own bills fetched via /api/v1/billing/me/bills
  const myBills = useBillingStore((state) => state.myBills);
  const createPayment = useBillingStore((state) => state.createPayment);

  const [payingBill, setPayingBill] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [loading, setLoading] = useState(false);

  const pendingBills = useMemo(
    () =>
      myBills
        .filter(
          (bill) =>
            bill.status === "Pending" ||
            bill.status === "pending" ||
            bill.status === "Overdue" ||
            bill.status === "overdue"
        )
        .sort(
          (a, b) =>
            new Date(a.due_date || a.dueDate || 0) -
            new Date(b.due_date || b.dueDate || 0)
        ),
    [myBills]
  );

  const totalPending = useMemo(
    () =>
      pendingBills.reduce(
        (sum, bill) => sum + Number(bill.total_amount || bill.amount || 0),
        0
      ),
    [pendingBills]
  );

  const handlePay = async () => {
    if (!payingBill) return;
    setLoading(true);
    const res = await createPayment({
      bill_id: payingBill.bill_id || payingBill.id,
      amount: Number(payingBill.total_amount || payingBill.amount || 0),
      payment_method: paymentMethod,
      transaction_reference: `TXN-${Date.now()}`,
      status: "completed",
    });
    setLoading(false);
    if (res.success) {
      toast.success(
        `₹${Number(payingBill.total_amount || payingBill.amount || 0).toLocaleString()} paid successfully via ${paymentMethod}!`
      );
      setPayingBill(null);
    } else {
      toast.error(res.message || "Payment failed. Please try again.");
    }
  };

  const formatAmount = (bill) =>
    Number(bill.total_amount || bill.amount || 0).toLocaleString();

  const formatDueDate = (bill) => {
    const d = bill.due_date || bill.dueDate;
    if (!d) return "N/A";
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getBillLabel = (bill) =>
    bill.bill_type || bill.category || `Bill #${bill.bill_id || bill.id}`;

  return (
    <>
      <Card
        title="Upcoming Bills"
        subtitle="Pending maintenance and utility payments"
      >
        <div className="mb-5 flex items-center justify-between rounded-xl bg-indigo-50 p-4 dark:bg-slate-900">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Total Pending
            </p>
            <h2 className="mt-1 text-3xl font-bold text-indigo-700 dark:text-indigo-400">
              ₹{totalPending.toLocaleString()}
            </h2>
          </div>
          <CreditCard size={34} className="text-indigo-600" />
        </div>

        <div className="space-y-4">
          {pendingBills.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center">
              <p className="text-slate-500 dark:text-slate-400">
                🎉 No pending bills.
              </p>
            </div>
          ) : (
            pendingBills.map((bill) => (
              <div
                key={bill.bill_id || bill.id}
                className="flex flex-col gap-4 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 p-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-100">
                    {getBillLabel(bill)}
                  </h4>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Due: {formatDueDate(bill)}
                  </p>
                  <p className="mt-1 text-lg font-bold text-slate-800 dark:text-slate-100">
                    ₹{formatAmount(bill)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="warning">
                    {bill.status === "overdue" || bill.status === "Overdue"
                      ? "Overdue"
                      : "Pending"}
                  </Badge>
                  <Button size="sm" onClick={() => setPayingBill(bill)}>
                    Pay Now
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Quick Pay Modal */}
      <Modal
        open={!!payingBill}
        title="Quick Pay"
        onClose={() => setPayingBill(null)}
      >
        {payingBill && (
          <div className="space-y-5">
            <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950 p-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Category
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">
                  {getBillLabel(payingBill)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Amount
                </span>
                <span className="text-lg font-bold text-indigo-600">
                  ₹{formatAmount(payingBill)}
                </span>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="h-12 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-4 outline-none focus:border-indigo-600"
              >
                <option>UPI</option>
                <option>Credit Card</option>
                <option>Debit Card</option>
                <option>Net Banking</option>
                <option>Cash</option>
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setPayingBill(null)}
              >
                Cancel
              </Button>
              <Button loading={loading} onClick={handlePay}>
                {loading
                  ? "Processing..."
                  : `Pay ₹${formatAmount(payingBill)}`}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default UpcomingBills;