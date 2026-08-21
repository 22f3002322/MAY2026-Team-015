import { useMemo } from "react";
import {
  IndianRupee,
  Receipt,
  Clock3,
  CheckCircle2,
} from "lucide-react";

import Card from "../../ui/Card";
import useBillingStore from "../../../store/billingStore";

const isPaid = (bill) =>
  String(bill.status || "").toLowerCase() === "paid";

const BillStats = ({ bills: billsProp }) => {
  const myBills = useBillingStore((state) => state.myBills);
  const bills = billsProp || myBills;

  const stats = useMemo(() => {
    const totalBills = bills.length;
    const pendingBills = bills.filter((bill) => !isPaid(bill));
    const paidBills = bills.filter((bill) => isPaid(bill));
    const pendingAmount = pendingBills.reduce(
      (sum, bill) => sum + Number(bill.amount || bill.total_amount || 0),
      0
    );

    return [
      {
        title: "Total Bills",
        value: totalBills,
        icon: Receipt,
        color: "bg-indigo-100 text-indigo-600",
      },
      {
        title: "Pending Bills",
        value: pendingBills.length,
        icon: Clock3,
        color: "bg-amber-100 text-amber-600",
      },
      {
        title: "Paid Bills",
        value: paidBills.length,
        icon: CheckCircle2,
        color: "bg-emerald-100 text-emerald-600",
      },
      {
        title: "Pending Amount",
        value: `₹${pendingAmount.toLocaleString()}`,
        icon: IndianRupee,
        color: "bg-red-100 text-red-600",
      },
    ];
  }, [bills]);

  return (
    <div className="mb-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.title}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {item.title}
                </p>
                <h2 className="mt-3 text-3xl font-bold text-slate-800 dark:text-slate-100">
                  {item.value}
                </h2>
              </div>
              <div className={`rounded-xl p-3 ${item.color}`}>
                <Icon size={24} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default BillStats;
