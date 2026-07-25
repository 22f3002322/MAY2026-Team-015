import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

import Card from "../ui/Card";

import useReportStore from "../../store/reportStore";

const OccupancyChart = () => {
  const occupancyData = useReportStore(
    (state) => state.occupancyData
  );

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-800">
          Apartment Occupancy
        </h3>

        <p className="text-sm text-slate-500">
          Current occupancy status across the society
        </p>
      </div>

      <ResponsiveContainer
        width="100%"
        height={340}
      >
        <BarChart
          data={occupancyData}
          layout="vertical"
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal
            vertical={false}
          />

          <XAxis type="number" />

          <YAxis
            dataKey="status"
            type="category"
            width={100}
          />

          <Tooltip />

          <Bar
            dataKey="apartments"
            radius={[0, 8, 8, 0]}
          >
            {occupancyData.map((entry) => (
              <Cell
                key={entry.status}
                fill={entry.color}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default OccupancyChart;