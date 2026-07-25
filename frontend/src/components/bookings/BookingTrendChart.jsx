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

import useBookingStore from "../../store/bookingStore";

const BookingTrendChart = () => {
  const bookings = useBookingStore(
    (state) => state.bookings
  );

  const data = Array.from(
    { length: 12 },
    (_, index) => ({
      month: new Date(
        2026,
        index
      ).toLocaleString("default", {
        month: "short",
      }),
      bookings: bookings.filter((booking) => {
        if (!booking.createdAt)
          return false;

        return (
          new Date(
            booking.createdAt
          ).getMonth() === index
        );
      }).length,
    })
  );

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