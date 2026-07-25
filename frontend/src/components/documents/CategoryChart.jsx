import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import Card from "../ui/Card";

import useDocumentStore from "../../store/documentStore";

const COLORS = [
  "#4F46E5",
  "#22C55E",
  "#F59E0B",
  "#EF4444",
  "#06B6D4",
  "#8B5CF6",
  "#14B8A6",
  "#EC4899",
];

const CategoryChart = () => {
  const documents = useDocumentStore(
    (state) => state.documents
  );

  const categoryMap = documents.reduce(
    (acc, doc) => {
      acc[doc.category] =
        (acc[doc.category] || 0) + 1;

      return acc;
    },
    {}
  );

  const data = Object.entries(categoryMap).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  return (
    <Card className="p-6">
      <h3 className="mb-5 text-lg font-semibold text-slate-800">
        Documents by Category
      </h3>

      <ResponsiveContainer
        width="100%"
        height={420}
      >
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={140}
            label
          >
            {data.map((entry, index) => (
              <Cell
                key={entry.name}
                fill={
                  COLORS[
                    index % COLORS.length
                  ]
                }
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

export default CategoryChart;