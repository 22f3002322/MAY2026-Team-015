import { useMemo, useState } from "react";
import { CreditCard } from "lucide-react";
import { toast } from "sonner";

import Card from "../../ui/Card";
import Button from "../../ui/Button";
import Badge from "../../ui/Badge";
import Modal from "../../ui/Modal";

import useBillingStore from "../../../store/billingStore";
import useAuthStore from "../../../store/authStore";

const UpcomingBills = () => {
  const bills = useBillingStore((state) => state.bills);
  const markPaid = useBillingStore((state) => state.markPaid);
  const user = useAuthStore((state) => state.user);

  const [payingBill, setPayingBill] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [loading, setLoading] = useState(false);

  const pendingBills = useMemo(
    () =>
      bills
        .filter(
          (bill) =>
            bill.flat === user?.flat &&
            bill.status === "Pending"
        )
        .sort(
          (a, b) =>
            new Date(a.dueDate) -
            new Date(b.dueDate)
        ),
    [bills, user]
  );

  const totalPending = useMemo(
    () =>
      pendingBills.reduce(
        (sum, bill) =>
          sum + Number(bill.amount),
        0
      ),
    [pendingBills]
  );

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

          <h2 className="mt-1 text-3xl font-bold text-indigo-700">
            ₹{totalPending.toLocaleString()}
          </h2>
        </div>

        <CreditCard
          size={34}
          className="text-indigo-600"
        />
      </div>

      <div className="space-y-4">
        {pendingBills.length === 0 ? (
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 border-dashed border-slate-300 dark:border-slate-700 p-6 text-center">
            <p className="text-slate-500 dark:text-slate-400">
              🎉 No pending bills.
            </p>
          </div>
        ) : (
          pendingBills.map((bill) => (
            <div
              key={bill.id}
              className="flex flex-col gap-4 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 p-4 lg:flex-row lg:items-center lg:justify-between"
            >
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-100">
                  {bill.category}
                </h4>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Due: {bill.dueDate}
                </p>

                <p className="mt-1 text-lg font-bold text-slate-800 dark:text-slate-100">
                  ₹{Number(
                    bill.amount
                  ).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant="warning">
                  Pending
                </Badge>

                <Button
                  size="sm"
                  onClick={() => setPayingBill(bill)}
                >
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
              <span className="text-sm text-slate-500 dark:text-slate-400">Category</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100">{payingBill.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">Amount</span>
              <span className="text-lg font-bold text-indigo-600">₹{Number(payingBill.amount).toLocaleString()}</span>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Payment Method</label>
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
            <Button variant="outline" onClick={() => setPayingBill(null)}>Cancel</Button>
            <Button
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                await new Promise((r) => setTimeout(r, 800));
                markPaid(payingBill.id, paymentMethod);
                toast.success(`₹${Number(payingBill.amount).toLocaleString()} paid successfully via ${paymentMethod}!`);
                setLoading(false);
                setPayingBill(null);
              }}
            >
              {loading ? "Processing..." : `Pay ₹${Number(payingBill.amount).toLocaleString()}`}
            </Button>
          </div>
        </div>
      )}
    </Modal>
    </>
  );
};

export default UpcomingBills;