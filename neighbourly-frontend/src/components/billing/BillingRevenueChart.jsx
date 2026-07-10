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

const data = [
  {
    month: "Jan",
    revenue: 120000,
  },
  {
    month: "Feb",
    revenue: 165000,
  },
  {
    month: "Mar",
    revenue: 182000,
  },
  {
    month: "Apr",
    revenue: 210000,
  },
  {
    month: "May",
    revenue: 245000,
  },
  {
    month: "Jun",
    revenue: 280000,
  },
];

const BillingRevenueChart = () => {
  return (
    <Card>

      <h3 className="mb-5 text-lg font-semibold text-slate-800">
        Monthly Revenue
      </h3>

      <ResponsiveContainer
        width="100%"
        height={320}
      >
        <AreaChart data={data}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="month" />

          <YAxis />

          <Tooltip
            formatter={(value) => [
              `₹${value.toLocaleString()}`,
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