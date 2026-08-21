import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Card from "../ui/Card";

const PollResultsChart = ({ data }) => {
  const chartData = data?.results?.map((r) => ({ option: r.option_text, votes: r.vote_count })) || [];

  return (
    <Card className="p-6">
      <h3 className="mb-5 text-lg font-semibold text-slate-800">
        Latest Poll Results{data?.question ? ` — ${data.question}` : ""}
      </h3>
      {chartData.length === 0 ? (
        <div className="flex h-80 items-center justify-center text-sm text-slate-500 dark:text-slate-400">
          No poll data available yet.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="option" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="votes" radius={[8, 8, 0, 0]} fill="#4F46E5" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
};

export default PollResultsChart;