import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import Card from "../ui/Card";

import useNoticeStore from "../../store/noticeStore";

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const NoticeTimelineChart = () => {
  const notices = useNoticeStore(
    (state) => state.notices
  );

  const monthlyData = Array(12)
    .fill(0)
    .map((_, index) => ({
      month: months[index],
      notices: 0,
    }));

  notices.forEach((notice) => {
    if (!notice.publishDate) return;

    const month = new Date(
      notice.publishDate
    ).getMonth();

    monthlyData[month].notices += 1;
  });

  return (
    <Card>
      <h3 className="mb-5 text-lg font-semibold text-slate-800">
        Notice Activity
      </h3>

      <ResponsiveContainer
        width="100%"
        height={320}
      >
        <LineChart data={monthlyData}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="month" />

          <YAxis allowDecimals={false} />

          <Tooltip
            formatter={(value) => [
              value,
              "Notices",
            ]}
          />

          <Line
            type="monotone"
            dataKey="notices"
            stroke="#4F46E5"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default NoticeTimelineChart;