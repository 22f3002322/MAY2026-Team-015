import { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import Card from "../ui/Card";
import useVisitorStore from "../../store/visitorStore";

const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#06B6D4", "#8B5CF6"];

const VisitorPurposeChart = () => {
  const logs = useVisitorStore((state) => state.logs);

  const data = useMemo(() => {
    const counts = {};
    logs.forEach((log) => {
      const raw = log.visitor_type || "Other";
      const label = raw.charAt(0).toUpperCase() + raw.slice(1);
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [logs]);

  return (
    <Card>
      <h3 className="mb-5 text-lg font-semibold">Visitors by Purpose</h3>
      {data.length === 0 ? (
        <div className="flex h-80 items-center justify-center text-sm text-slate-500 dark:text-slate-400">
          No visitor data available yet.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" outerRadius={110} label>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
};

export default VisitorPurposeChart;