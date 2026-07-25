import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import Card from "../ui/Card";
import useStaffStore from "../../store/staffStore";

const StaffAttendanceChart = () => {
  const staff = useStaffStore(
    (state) => state.staff
  );

  const active = staff.filter(
    (employee) => employee.status === "Active"
  ).length;

  const onLeave = staff.filter(
    (employee) => employee.status === "On Leave"
  ).length;

  const inactive = staff.filter(
    (employee) => employee.status === "Inactive"
  ).length;

  const data = [
    {
      status: "Active",
      total: active,
    },
    {
      status: "On Leave",
      total: onLeave,
    },
    {
      status: "Inactive",
      total: inactive,
    },
  ];

  return (
    <Card>
      <h3 className="mb-5 text-lg font-semibold">
        Staff Status Overview
      </h3>

      <ResponsiveContainer
        width="100%"
        height={320}
      >
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="status" />

          <YAxis allowDecimals={false} />

          <Tooltip />

          <Bar
            dataKey="total"
            fill="#4F46E5"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default StaffAttendanceChart;