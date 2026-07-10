import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import Card from "../ui/Card";

const data = [
  { month: "Jan", bookings: 24 },
  { month: "Feb", bookings: 31 },
  { month: "Mar", bookings: 42 },
  { month: "Apr", bookings: 38 },
  { month: "May", bookings: 55 },
  { month: "Jun", bookings: 48 },
];

const BookingTrendChart = () => {
  return (
    <Card>
      <h3 className="mb-5 text-lg font-semibold">
        Monthly Booking Trend
      </h3>

      <ResponsiveContainer
        width="100%"
        height={320}
      >
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="month" />

          <YAxis />

          <Tooltip />

          <Area
            type="monotone"
            dataKey="bookings"
            stroke="#4F46E5"
            fill="#C7D2FE"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default BookingTrendChart;