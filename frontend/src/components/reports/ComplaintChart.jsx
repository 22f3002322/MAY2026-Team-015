import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import Card from "../ui/Card";

import useReportStore from "../../store/reportStore";

const COLORS = [
  "#4F46E5",
  "#22C55E",
  "#F59E0B",
  "#EF4444",
  "#06B6D4",
];

const ComplaintChart = () => {
  const complaintData = useReportStore(
    (state) => state.complaintData
  );

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-800">
          Complaint Categories
        </h3>

        <p className="text-sm text-slate-500">
          Distribution of complaints by category
        </p>
      </div>

      <ResponsiveContainer
        width="100%"
        height={340}
      >
        <PieChart>
          <Pie
            data={complaintData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={110}
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
          >
            {complaintData.map((entry, index) => (
              <Cell
                key={entry.name}
                fill={COLORS[index % COLORS.length]}
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

export default ComplaintChart;