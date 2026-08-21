import { useMemo, useState } from "react";
import { CreditCard } from "lucide-react";
import { toast } from "sonner";

import Card from "../../ui/Card";
import Button from "../../ui/Button";
import Badge from "../../ui/Badge";
import Modal from "../../ui/Modal";

import useBillingStore from "../../../store/billingStore";

const isUnpaid = (bill) =>
  String(bill.status || "").toLowerCase() === "unpaid";

const UpcomingBills = () => {
  const myBills = useBillingStore((state) => state.myBills);
  const createPayment = useBillingStore((state) => state.createPayment);
  const fetchMyBills = useBillingStore((state) => state.fetchMyBills);

  const [payingBill, setPayingBill] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [loading, setLoading] = useState(false);

  const pendingBills = useMemo(
    () =>
      myBills
        .filter(isUnpaid)
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
    try {
      const res = await createPayment({
        bill_id: payingBill.bill_id || payingBill.id,
        amount: String(payingBill.total_amount || payingBill.amount || 0),
        payment_method: String(paymentMethod || "upi").toLowerCase(),
        transaction_reference: `TXN-${Date.now()}`,
        status: "success",
      });
      if (res.success) {
        toast.success(
          `₹${Number(payingBill.total_amount || payingBill.amount || 0).toLocaleString()} paid successfully!`
        );
        setPayingBill(null);
        await fetchMyBills();
      } else {
        toast.error(res.message || "Payment failed. Please try again.");
      }
    } catch (err) {
      toast.error(err?.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
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
    bill.billing_month
      ? `Maintenance — ${bill.billing_month}`
      : `Bill #${bill.bill_id || bill.id}`;

  return (
    <>
      <Card
        title="Upcoming Bills"
        subtitle="Pending maintenance payments"
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
            <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center dark:border-slate-700">
              <p className="text-slate-500 dark:text-slate-400">
                No unpaid bills.
              </p>
            </div>
          ) : (
            pendingBills.map((bill) => (
              <div
                key={bill.bill_id || bill.id}
                className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 dark:border-slate-700 dark:bg-slate-800 lg:flex-row lg:items-center lg:justify-between"
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
                  <Badge variant="warning">Unpaid</Badge>
                  <Button size="sm" onClick={() => setPayingBill(bill)}>
                    Pay Now
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Modal
        open={!!payingBill}
        title="Quick Pay"
        onClose={() => setPayingBill(null)}
      >
        {payingBill && (
          <div className="space-y-5">
            <div className="rounded-xl bg-indigo-50 p-4 dark:bg-indigo-950">
              <div className="mb-2 flex justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Bill
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
                className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-900 outline-none focus:border-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="netbanking">Net Banking</option>
                <option value="cash">Cash</option>
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setPayingBill(null)}>
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
