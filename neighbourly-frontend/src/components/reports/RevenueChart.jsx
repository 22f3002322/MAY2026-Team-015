import { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import Card from "../ui/Card";
import useBillingStore from "../../store/billingStore";

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const RevenueChart = () => {
  const bills = useBillingStore(
    (state) => state.bills
  );

  const revenueData = useMemo(() => {
    const revenue = months.map((month) => ({
      month,
      revenue: 0,
    }));

    bills.forEach((bill) => {
      if (
        bill.status !== "Paid" ||
        !bill.paidDate
      )
        return;

      // paidDate format: "08 Jul 2026"
      const monthName =
        bill.paidDate.split(" ")[1];

      const index =
        months.indexOf(monthName);

      if (index !== -1) {
        revenue[index].revenue += Number(
          bill.amount
        );
      }
    });

    return revenue;
  }, [bills]);

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-800">
          Monthly Revenue
        </h3>

        <p className="text-sm text-slate-500">
          Revenue collected from paid bills
        </p>
      </div>

      <ResponsiveContainer
        width="100%"
        height={340}
      >
        <AreaChart data={revenueData}>
          <defs>
            <linearGradient
              id="revenueGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="5%"
                stopColor="#4F46E5"
                stopOpacity={0.4}
              />
              <stop
                offset="95%"
                stopColor="#4F46E5"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
          />

          <XAxis dataKey="month" />

          <YAxis
            tickFormatter={(value) =>
              `₹${(
                value / 1000
              ).toFixed(0)}k`
            }
          />

          <Tooltip
            formatter={(value) => [
              `₹${Number(
                value
              ).toLocaleString()}`,
              "Revenue",
            ]}
          />

          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#4F46E5"
            strokeWidth={3}
            fill="url(#revenueGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default RevenueChart;