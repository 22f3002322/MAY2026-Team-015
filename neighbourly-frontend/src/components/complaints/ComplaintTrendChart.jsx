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

const data = [
  { month: "Jan", complaints: 12 },
  { month: "Feb", complaints: 18 },
  { month: "Mar", complaints: 15 },
  { month: "Apr", complaints: 22 },
  { month: "May", complaints: 30 },
  { month: "Jun", complaints: 25 },
];

const ComplaintTrendChart = () => {
  return (
    <Card>
      <h3 className="mb-5 text-lg font-semibold">
        Monthly Complaint Trend
      </h3>

      <ResponsiveContainer
        width="100%"
        height={320}
      >
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="month" />

          <YAxis />

          <Tooltip />

          <Area
            type="monotone"
            dataKey="complaints"
            stroke="#4F46E5"
            fill="#C7D2FE"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default ComplaintTrendChart;