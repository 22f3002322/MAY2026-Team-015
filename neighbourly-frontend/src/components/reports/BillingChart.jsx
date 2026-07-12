import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

import Card from "../ui/Card";

import useReportStore from "../../store/reportStore";

const BillingChart = () => {
  const billingData = useReportStore(
    (state) => state.billingData
  );

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-800">
          Billing Collection
        </h3>

        <p className="text-sm text-slate-500">
          Paid, pending and overdue maintenance bills
        </p>
      </div>

      <ResponsiveContainer
        width="100%"
        height={340}
      >
        <BarChart data={billingData}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
          />

          <XAxis dataKey="month" />

          <YAxis />

          <Tooltip />

          <Legend />

          <Bar
            dataKey="paid"
            stackId="billing"
            fill="#22C55E"
            radius={[0, 0, 4, 4]}
          />

          <Bar
            dataKey="pending"
            stackId="billing"
            fill="#F59E0B"
          />

          <Bar
            dataKey="overdue"
            stackId="billing"
            fill="#EF4444"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default BillingChart;