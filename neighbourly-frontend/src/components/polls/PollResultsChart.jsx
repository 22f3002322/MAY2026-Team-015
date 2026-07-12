import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import Card from "../ui/Card";

const data = [
  {
    option: "Yes",
    votes: 94,
  },
  {
    option: "No",
    votes: 30,
  },
];

const PollResultsChart = () => {
  return (
    <Card className="p-6">

      <h3 className="mb-5 text-lg font-semibold text-slate-800">
        Latest Poll Results
      </h3>

      <ResponsiveContainer
        width="100%"
        height={320}
      >
        <BarChart data={data}>

          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
          />

          <XAxis dataKey="option" />

          <YAxis />

          <Tooltip />

          <Bar
            dataKey="votes"
            radius={[8, 8, 0, 0]}
            fill="#4F46E5"
          />

        </BarChart>
      </ResponsiveContainer>

    </Card>
  );
};

export default PollResultsChart;