import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import Card from "../ui/Card";

import useReportStore from "../../store/reportStore";

const VisitorChart = () => {
  const visitorData = useReportStore(
    (state) => state.visitorData
  );

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-800">
          Weekly Visitor Trend
        </h3>

        <p className="text-sm text-slate-500">
          Number of visitors entering the society this week
        </p>
      </div>

      <ResponsiveContainer
        width="100%"
        height={340}
      >
        <AreaChart data={visitorData}>
          <defs>
            <linearGradient
              id="visitorGradient"
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

          <XAxis dataKey="day" />

          <YAxis />

          <Tooltip />

          <Area
            type="monotone"
            dataKey="visitors"
            stroke="#4F46E5"
            strokeWidth={3}
            fill="url(#visitorGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default VisitorChart;