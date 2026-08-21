import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import Card from "../ui/Card";

import useComplaintStore from "../../store/complaintStore";

const MONTHS = [
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

const ComplaintTrendChart = () => {
  const complaints = useComplaintStore(
    (state) => state.complaints
  );

  const monthCounts = new Array(12).fill(0);

  complaints.forEach((complaint) => {
    const raw = complaint.created_at || complaint.createdAt;
    if (!raw) return;
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return;
    monthCounts[date.getMonth()]++;
  });

  const data = MONTHS.map((month, index) => ({
    month,
    complaints: monthCounts[index],
  }));

  return (
    <Card>
      <h3 className="mb-5 text-lg font-semibold">
        Monthly Complaint Trend
      </h3>

      <ResponsiveContainer
        width="100%"
        height={320}
      >
        <AreaChart data={data}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="month" />

          <YAxis allowDecimals={false} />

          <Tooltip />

          <Area
            type="monotone"
            dataKey="complaints"
            stroke="#4F46E5"
            fill="#C7D2FE"
          />

        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default ComplaintTrendChart;