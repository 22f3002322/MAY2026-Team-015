import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import Card from "../ui/Card";
import useStaffStore from "../../store/staffStore";

const COLORS = [
  "#4F46E5",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#06B6D4",
];

const StaffDepartmentChart = () => {
  const staff = useStaffStore(
    (state) => state.staff
  );

  const departmentMap = {};

  staff.forEach((employee) => {
    departmentMap[employee.department] =
      (departmentMap[employee.department] || 0) + 1;
  });

  const data = Object.keys(departmentMap).map((key) => ({
    name: key,
    value: departmentMap[key],
  }));

  return (
    <Card>
      <h3 className="mb-5 text-lg font-semibold">
        Staff by Department
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
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default StaffDepartmentChart;