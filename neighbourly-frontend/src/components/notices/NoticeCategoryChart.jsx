import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import Card from "../ui/Card";

import useNoticeStore from "../../store/noticeStore";

const COLORS = [
  "#4F46E5",
  "#22C55E",
  "#F59E0B",
  "#EF4444",
  "#06B6D4",
  "#8B5CF6",
];

const NoticeCategoryChart = () => {
  const notices = useNoticeStore(
    (state) => state.notices
  );

  const categoryMap = {};

  notices.forEach((notice) => {
    categoryMap[notice.category] =
      (categoryMap[notice.category] || 0) + 1;
  });

  const data = Object.entries(categoryMap).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

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
            {data.map((_, index) => (
              <Cell
                key={index}
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

export default NoticeCategoryChart;