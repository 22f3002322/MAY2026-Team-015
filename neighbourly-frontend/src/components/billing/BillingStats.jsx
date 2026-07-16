import {
  IndianRupee,
  Receipt,
  Wallet,
  Clock,
} from "lucide-react";

import Card from "../ui/Card";
import useBillingStore from "../../store/billingStore";

const BillingStats = () => {
  const bills = useBillingStore((state) => state.bills);

  const totalRevenue = bills
    .filter((bill) => bill.status === "Paid")
    .reduce(
      (sum, bill) => sum + Number(bill.amount || 0),
      0
    );

  const totalBills = bills.length;

  const paidBills = bills.filter(
    (bill) => bill.status === "Paid"
  ).length;

  const pendingBills = bills.filter(
    (bill) =>
      bill.status === "Pending" ||
      bill.status === "Overdue"
  ).length;

  const stats = [
    {
      title: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: IndianRupee,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Bills Generated",
      value: totalBills,
      icon: Receipt,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Payments Received",
      value: paidBills,
      icon: Wallet,
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      title: "Pending Bills",
      value: pendingBills,
      icon: Clock,
      color: "bg-orange-100 text-orange-600",
    },
  ];

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

                <h2 className="mt-3 text-3xl font-bold">
                  {item.value}
                </h2>
              </div>

              <div
                className={`rounded-xl p-3 ${item.color}`}
              >
                <Icon size={24} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default BillingStats;