import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import Card from "../ui/Card";
import usePollStore from "../../store/pollStore";

const COLORS = ["#22C55E", "#3B82F6", "#F59E0B"];

const getPollStatus = (poll) => {
  const today = new Date().toISOString().split("T")[0];
  if (!poll.is_active) return "Closed";
  if (poll.start_date && poll.start_date > today) return "Upcoming";
  if (poll.end_date && poll.end_date < today) return "Closed";
  return "Active";
};

const PollStatusChart = () => {
  const polls = usePollStore((state) => state.polls);

  const counts = { Active: 0, Closed: 0, Upcoming: 0 };
  polls.forEach((poll) => {
    const status = getPollStatus(poll);
    counts[status] = (counts[status] || 0) + 1;
  });

  const data = [
    { name: "Active", value: counts.Active },
    { name: "Closed", value: counts.Closed },
    { name: "Upcoming", value: counts.Upcoming },
  ];

  return (
    <Card className="p-6">
      <h3 className="mb-5 text-lg font-semibold text-slate-800">Poll Status Distribution</h3>
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} label>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index]} />
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