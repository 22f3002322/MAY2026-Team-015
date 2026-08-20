import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
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

const BillingRevenueChart = () => {
  const bills = useBillingStore(
    (state) => state.bills
  );

  const monthlyRevenue = months.map((month) => ({ month, revenue: 0 }));

  bills.forEach((bill) => {
    if (String(bill.status || "").toLowerCase() !== "paid") return;

    const dateStr = bill.paid_at || bill.generated_at;   // was bill.createdAt || bill.updatedAt (neither exists)
    if (!dateStr) return;

    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return;

    monthlyRevenue[date.getMonth()].revenue += Number(bill.amount || 0);
  });

  return (
    <Card>
      <h3 className="mb-5 text-lg font-semibold text-slate-800">
        Monthly Revenue
      </h3>

      <ResponsiveContainer
        width="100%"
        height={320}
      >
        <AreaChart data={monthlyRevenue}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="month" />

          <YAxis />

          <Tooltip
            formatter={(value) => [
              `₹${Number(value).toLocaleString()}`,
              "Revenue",
            ]}
          />

          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#4F46E5"
            fill="#C7D2FE"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default BillingRevenueChart;