import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import Card from "../ui/Card";

import useComplaintStore from "../../store/complaintStore";

const COLORS = [
  "#4F46E5",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#06B6D4",
  "#8B5CF6",
  "#EC4899",
];

const ComplaintCategoryChart = () => {
  const complaints = useComplaintStore(
    (state) => state.complaints
  );

  // Count complaints by category
  const categoryMap = complaints.reduce((acc, complaint) => {
    const category = complaint.category || "Other";

    acc[category] = (acc[category] || 0) + 1;

    return acc;
  }, {});

  const data = Object.entries(categoryMap).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

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
                key={entry.name}
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