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

const COLORS = ["#EF4444", "#3B82F6", "#F59E0B", "#10B981"];

// Normalize backend status (backend stores lowercase like "open", "assigned", "in_progress", "resolved")
const normalizeStatus = (status) => {
  if (!status) return "Open";
  const s = String(status).toLowerCase().replace(/_/g, " ");
  const map = {
    "open": "Open",
    "assigned": "Assigned",
    "in progress": "In Progress",
    "resolved": "Resolved",
    "closed": "Resolved",
  };
  return map[s] || status;
};

const getVariant = (status) => {
  switch (normalizeStatus(status)) {
    case "Open": return "danger";
    case "Assigned": return "primary";
    case "In Progress": return "warning";
    case "Resolved": return "success";
    default: return "default";
  }
};

const ComplaintOverview = () => {
  // Backend returns only the current resident's own complaints via /api/v1/complaints
  const complaints = useComplaintStore((state) => state.complaints);

  const chartData = useMemo(() => [
    {
      name: "Open",
      value: complaints.filter(
        (c) => normalizeStatus(c.status) === "Open"
      ).length,
    },
    {
      name: "Assigned",
      value: complaints.filter(
        (c) => normalizeStatus(c.status) === "Assigned"
      ).length,
    },
    {
      name: "In Progress",
      value: complaints.filter(
        (c) => normalizeStatus(c.status) === "In Progress"
      ).length,
    },
    {
      name: "Resolved",
      value: complaints.filter(
        (c) => normalizeStatus(c.status) === "Resolved"
      ).length,
    },
  ], [complaints]);

  const recentComplaints = useMemo(
    () =>
      [...complaints]
        .sort(
          (a, b) =>
            new Date(b.created_at || b.createdAt || 0) -
            new Date(a.created_at || a.createdAt || 0)
        )
        .slice(0, 4),
    [complaints]
  );

  return (
    <Card
      title="My Complaints"
      subtitle="Complaint status overview"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
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
                    fill={COLORS[index % COLORS.length]}
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
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No complaints found.
            </p>
          ) : (
            recentComplaints.map((complaint) => (
              <div
                key={complaint.complaint_id || complaint.id}
                className="rounded-xl border border-slate-200 dark:border-slate-700 p-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200">
                    {complaint.title}
                  </h4>
                  <Badge variant={getVariant(complaint.status)}>
                    {normalizeStatus(complaint.status)}
                  </Badge>
                </div>

                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {complaint.category?.name || complaint.category || "General"}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  {complaint.created_at || complaint.createdAt
                    ? new Date(
                        complaint.created_at || complaint.createdAt
                      ).toLocaleDateString()
                    : "-"}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
};

export default ComplaintOverview;