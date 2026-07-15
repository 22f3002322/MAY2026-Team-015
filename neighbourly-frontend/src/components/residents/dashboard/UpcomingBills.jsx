import { useMemo } from "react";
import { CreditCard } from "lucide-react";

import Card from "../../ui/Card";
import Button from "../../ui/Button";
import Badge from "../../ui/Badge";

import useBillingStore from "../../../store/billingStore";
import useResidentStore from "../../../store/residentStore";

const UpcomingBills = () => {
  const bills = useBillingStore(
    (state) => state.bills
  );

  const resident = useResidentStore(
    (state) => state.residents[0]
  );

  const pendingBills = useMemo(
    () =>
      bills
        .filter(
          (bill) =>
            bill.flat === resident?.flat &&
            bill.status === "Pending"
        )
        .sort(
          (a, b) =>
            new Date(a.dueDate) -
            new Date(b.dueDate)
        ),
    [bills, resident]
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
    <Card
      title="Upcoming Bills"
      subtitle="Pending maintenance and utility payments"
    >
      <div className="mb-5 flex items-center justify-between rounded-xl bg-indigo-50 p-4">
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
                  onClick={() =>
                    console.log(
                      "Pay Bill",
                      bill.id
                    )
                  }
                >
                  Pay Now
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default UpcomingBills;