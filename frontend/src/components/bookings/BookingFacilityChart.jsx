import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import Card from "../ui/Card";

import useBookingStore from "../../store/bookingStore";

const COLORS = [
  "#4F46E5",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#06B6D4",
  "#8B5CF6",
  "#14B8A6",
];

const BookingFacilityChart = () => {
  const bookings = useBookingStore(
    (state) => state.bookings
  );

  const facilityMap = {};

  bookings.forEach((booking) => {
    facilityMap[booking.facility] =
      (facilityMap[booking.facility] || 0) + 1;
  });

  const data = Object.entries(facilityMap).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  return (
    <Card>
      <h3 className="mb-5 text-lg font-semibold">
        Facility Bookings
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
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default BookingFacilityChart;