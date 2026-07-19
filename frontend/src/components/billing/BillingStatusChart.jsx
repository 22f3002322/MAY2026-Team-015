import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import Card from "../ui/Card";

import useBillingStore from "../../store/billingStore";

const COLORS = [
  "#22C55E",
  "#F59E0B",
  "#EF4444",
];

const BillingStatusChart = () => {
  const bills = useBillingStore(
    (state) => state.bills
  );

  const data = [
    {
      name: "Paid",
      value: bills.filter(
        (bill) => bill.status === "Paid"
      ).length,
    },
    {
      name: "Pending",
      value: bills.filter(
        (bill) => bill.status === "Pending"
      ).length,
    },
    {
      name: "Overdue",
      value: bills.filter(
        (bill) => bill.status === "Overdue"
      ).length,
    },
  ].filter((item) => item.value > 0);

  return (
    <Card>
      <h3 className="mb-5 text-lg font-semibold text-slate-800">
        Payment Status
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
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
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

          <Tooltip
            formatter={(value) => [
              value,
              "Bills",
            ]}
          />

          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default BillingStatusChart;