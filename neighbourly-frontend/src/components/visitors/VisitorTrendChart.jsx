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
  { day: "Mon", visitors: 24 },
  { day: "Tue", visitors: 32 },
  { day: "Wed", visitors: 18 },
  { day: "Thu", visitors: 36 },
  { day: "Fri", visitors: 40 },
  { day: "Sat", visitors: 52 },
  { day: "Sun", visitors: 28 },
];

const VisitorTrendChart = () => {
  return (
    <Card>
      <h3 className="mb-5 text-lg font-semibold">
        Weekly Visitor Trend
      </h3>

      <ResponsiveContainer
        width="100%"
        height={320}
      >
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="day" />

          <YAxis />

          <Tooltip />

          <Area
            type="monotone"
            dataKey="visitors"
            stroke="#4F46E5"
            fill="#C7D2FE"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default VisitorTrendChart;