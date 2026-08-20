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

import useVisitorStore from "../../store/visitorStore";

const DAYS = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

const VisitorTrendChart = () => {
  const logs = useVisitorStore((state) => state.logs);   // was: state.visitors

  const dayCounts = new Array(7).fill(0);

  logs.forEach((log) => {
    const dateStr = log.entry_time || log.created_at;
    if (!dateStr) return;
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return;
    dayCounts[date.getDay()]++;
  });

  const data = DAYS.map((day, index) => ({ day, visitors: dayCounts[index] }));

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

          <YAxis allowDecimals={false} />

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