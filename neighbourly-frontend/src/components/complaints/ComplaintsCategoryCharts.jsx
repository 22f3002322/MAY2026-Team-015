import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import Card from "../ui/Card";

const data = [
  { name: "Electrical", value: 18 },
  { name: "Plumbing", value: 14 },
  { name: "Maintenance", value: 10 },
  { name: "Cleaning", value: 8 },
  { name: "Security", value: 5 },
];

const COLORS = [
  "#4F46E5",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#06B6D4",
];

const ComplaintCategoryChart = () => {
  return (
    <Card>
      <h3 className="mb-5 text-lg font-semibold">
        Complaints by Category
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
            outerRadius={110}
            label
          >
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={
                  COLORS[index % COLORS.length]
                }
              />
            ))}
          </Pie>

          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default ComplaintCategoryChart;