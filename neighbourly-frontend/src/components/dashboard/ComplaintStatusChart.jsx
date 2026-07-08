import Card from "../ui/Card";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = [
  "#EF4444",
  "#F59E0B",
  "#10B981",
  "#6366F1",
];

const ComplaintStatusChart = ({ data }) => {
  return (
    <Card
      title="Complaint Status"
      subtitle="Current complaint distribution"
    >
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              outerRadius={95}
              innerRadius={55}
              paddingAngle={4}
            >
              {data.map((_, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>

            <Tooltip />

            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default ComplaintStatusChart;