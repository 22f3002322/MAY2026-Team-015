import { useMemo } from "react";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

import Card from "../../ui/Card";
import Badge from "../../ui/Badge";

import useComplaintStore from "../../../store/complaintStore";
import useAuthStore from "../../../store/authStore";

const COLORS = [
  "#EF4444",
  "#3B82F6",
  "#F59E0B",
  "#10B981",
];

const ComplaintOverview = () => {
  const complaints = useComplaintStore(
    (state) => state.complaints
  );

  // Use logged-in user from authStore
  const user = useAuthStore(
    (state) => state.user
  );

  const myComplaints = useMemo(
    () =>
      complaints.filter(
        (complaint) =>
          complaint.flat === user?.flat
      ),
    [complaints, user]
  );

  const chartData = useMemo(
    () => [
      {
        name: "Open",
        value: myComplaints.filter(
          (c) => c.status === "Open"
        ).length,
      },
      {
        name: "Assigned",
        value: myComplaints.filter(
          (c) => c.status === "Assigned"
        ).length,
      },
      {
        name: "In Progress",
        value: myComplaints.filter(
          (c) => c.status === "In Progress"
        ).length,
      },
      {
        name: "Resolved",
        value: myComplaints.filter(
          (c) => c.status === "Resolved"
        ).length,
      },
    ],
    [myComplaints]
  );

  const recentComplaints = [...myComplaints]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
    )
    .slice(0, 4);

  return (
    <Card
      title="My Complaints"
      subtitle="Complaint status overview"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-72">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                outerRadius={80}
              >
                {chartData.map((_, index) => (
                  <Cell
                    key={index}
                    fill={
                      COLORS[
                        index % COLORS.length
                      ]
                    }
                  />
                ))}
              </Pie>

              <Tooltip />

              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4">
          {recentComplaints.length === 0 ? (
            <p className="text-sm text-slate-500">
              No complaints found.
            </p>
          ) : (
            recentComplaints.map(
              (complaint) => {
                let variant = "default";

                switch (
                  complaint.status
                ) {
                  case "Open":
                    variant = "danger";
                    break;

                  case "Assigned":
                    variant = "primary";
                    break;

                  case "In Progress":
                    variant = "warning";
                    break;

                  case "Resolved":
                    variant = "success";
                    break;

                  default:
                    variant = "default";
                }

                return (
                  <div
                    key={complaint.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-slate-800">
                        {complaint.title}
                      </h4>

                      <Badge
                        variant={variant}
                      >
                        {complaint.status}
                      </Badge>
                    </div>

                    <p className="mt-2 text-sm text-slate-500">
                      {
                        complaint.category
                      }
                    </p>

                    <p className="mt-2 text-xs text-slate-400">
                      {complaint.createdAt
                        ? new Date(
                            complaint.createdAt
                          ).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>
                );
              }
            )
          )}
        </div>
      </div>
    </Card>
  );
};

export default ComplaintOverview;