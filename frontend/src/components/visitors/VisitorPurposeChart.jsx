import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import Card from "../ui/Card";

const data = [
  { name: "Personal", value: 18 },
  { name: "Delivery", value: 12 },
  { name: "Maintenance", value: 8 },
  { name: "Courier", value: 6 },
  { name: "Others", value: 4 },
];

const COLORS = [
  "#4F46E5",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#06B6D4",
];

const VisitorPurposeChart = () => {
  return (
    <Card>
      <h3 className="mb-5 text-lg font-semibold">
        Visitors by Purpose
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
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default VisitorPurposeChart;