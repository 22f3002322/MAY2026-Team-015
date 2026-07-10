import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import Card from "../ui/Card";

const data = [
  {
    name: "Maintenance",
    value: 14,
  },
  {
    name: "Meeting",
    value: 8,
  },
  {
    name: "Parking",
    value: 6,
  },
  {
    name: "Safety",
    value: 5,
  },
  {
    name: "Events",
    value: 9,
  },
  {
    name: "General",
    value: 12,
  },
];

const COLORS = [
  "#4F46E5",
  "#22C55E",
  "#F59E0B",
  "#EF4444",
  "#06B6D4",
  "#8B5CF6",
];

const NoticeCategoryChart = () => {
  return (
    <Card>

      <h3 className="mb-5 text-lg font-semibold text-slate-800">
        Notices by Category
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

export default NoticeCategoryChart;