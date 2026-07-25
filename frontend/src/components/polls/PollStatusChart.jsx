import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import Card from "../ui/Card";
import usePollStore from "../../store/pollStore";

const COLORS = [
  "#22C55E",
  "#3B82F6",
  "#F59E0B",
];

const PollStatusChart = () => {
  const polls = usePollStore(
    (state) => state.polls
  );

  const data = [
    {
      name: "Active",
      value: polls.filter(
        (poll) => poll.status === "Active"
      ).length,
    },
    {
      name: "Closed",
      value: polls.filter(
        (poll) => poll.status === "Closed"
      ).length,
    },
    {
      name: "Upcoming",
      value: polls.filter(
        (poll) => poll.status === "Upcoming"
      ).length,
    },
  ];

  return (
    <Card className="p-6">
      <h3 className="mb-5 text-lg font-semibold text-slate-800">
        Poll Status Distribution
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
            cx="50%"
            cy="50%"
            outerRadius={110}
            label
          >
            {data.map((entry, index) => (
              <Cell
                key={entry.name}
                fill={COLORS[index]}
              />
            ))}
          </Pie>

          <Tooltip />

          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default PollStatusChart;