import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import Card from "../ui/Card";

const data = [
  { name: "Club House", value: 35 },
  { name: "Swimming Pool", value: 22 },
  { name: "Gym", value: 18 },
  { name: "Party Hall", value: 15 },
  { name: "Tennis Court", value: 10 },
];

const COLORS = [
  "#4F46E5",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#06B6D4",
];

const BookingFacilityChart = () => {
  return (
    <Card>
      <h3 className="mb-5 text-lg font-semibold">
        Facility Usage
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

export default BookingFacilityChart;