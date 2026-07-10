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
    name: "Paid",
    value: 318,
  },
  {
    name: "Pending",
    value: 22,
  },
  {
    name: "Overdue",
    value: 12,
  },
];

const COLORS = [
  "#22C55E",
  "#F59E0B",
  "#EF4444",
];

const BillingStatusChart = () => {
  return (
    <Card>

      <h3 className="mb-5 text-lg font-semibold text-slate-800">
        Payment Status
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

export default BillingStatusChart;