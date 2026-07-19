import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

import Card from "../ui/Card";

import useReportStore from "../../store/reportStore";

const PollChart = () => {
  const pollData = useReportStore(
    (state) => state.pollData
  );

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-800">
          Poll Participation
        </h3>

        <p className="text-sm text-slate-500">
          Total votes received for recent community polls
        </p>
      </div>

      <ResponsiveContainer
        width="100%"
        height={340}
      >
        <BarChart
          data={pollData}
          layout="vertical"
          margin={{
            top: 10,
            right: 20,
            left: 35,
            bottom: 10,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
          />

          <XAxis type="number" />

          <YAxis
            type="category"
            dataKey="poll"
            width={120}
          />

          <Tooltip />

          <Bar
            dataKey="votes"
            radius={[0, 8, 8, 0]}
          >
            {pollData.map((entry) => (
              <Cell
                key={entry.poll}
                fill={entry.color}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default PollChart;