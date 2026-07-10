import {
  LineChart,
  Line,
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
    notices: 6,
  },
  {
    month: "Feb",
    notices: 9,
  },
  {
    month: "Mar",
    notices: 12,
  },
  {
    month: "Apr",
    notices: 8,
  },
  {
    month: "May",
    notices: 15,
  },
  {
    month: "Jun",
    notices: 11,
  },
  {
    month: "Jul",
    notices: 18,
  },
];

const NoticeTimelineChart = () => {
  return (
    <Card>

      <h3 className="mb-5 text-lg font-semibold text-slate-800">
        Notice Activity
      </h3>

      <ResponsiveContainer
        width="100%"
        height={320}
      >
        <LineChart data={data}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="month" />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="notices"
            stroke="#4F46E5"
            strokeWidth={3}
          />

        </LineChart>
      </ResponsiveContainer>

    </Card>
  );
};

export default NoticeTimelineChart;