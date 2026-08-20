import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import Card from "../ui/Card";

import useBillingStore from "../../store/billingStore";

const COLORS = [
  "#22C55E",
  "#F59E0B",
  "#EF4444",
];

const BillingStatusChart = () => {
  const bills = useBillingStore(
    (state) => state.bills
  );

  const data = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let paid = 0;
    let pending = 0;
    let overdue = 0;

    bills.forEach((bill) => {
      const status = String(bill.status || "").toLowerCase();

      if (status === "paid") {
        paid += 1;
        return;
      }

      const due = bill.due_date ? new Date(bill.due_date) : null;
      if (due && !Number.isNaN(due.getTime()) && due < today) {
        overdue += 1;
      } else {
        pending += 1;
      }
    });

    return [
      { name: "Paid", value: paid },
      { name: "Pending", value: pending },
      { name: "Overdue", value: overdue },
    ].filter((item) => item.value > 0);
  }, [bills]);

  return (
    <Card>
      <h3 className="mb-5 text-lg font-semibold text-slate-800">
        Payment Status
      </h3>

      <ResponsiveContainer
        width="100%"
        height={320}
      >
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={110}
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
          >
            {data.map((entry, index) => (
              <Cell
                key={entry.name}
                fill={
                  COLORS[index % COLORS.length]
                }
              />
            ))}
          </Pie>

          <Tooltip
            formatter={(value) => [
              value,
              "Bills",
            ]}
          />

          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default BillingStatusChart;