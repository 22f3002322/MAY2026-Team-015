import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Layout from "../../components/layout/Layout";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Table from "../../components/ui/Table";

import StatCard from "../../components/dashboard/StatCard";
import QuickActions from "../../components/dashboard/QuickActions";
import ComplaintStatusChart from "../../components/dashboard/ComplaintStatusChart";
import ComplaintTrendChart from "../../components/dashboard/ComplaintTrendChart";

import useApartmentStore from "../../store/apartmentStore";
import useResidentStore from "../../store/residentStore";
import useComplaintStore from "../../store/complaintStore";
import useVisitorStore from "../../store/visitorStore";
import useBillingStore from "../../store/billingStore";
import useAuthStore from "../../store/authStore";
import CreateCommitteeModal from "../../components/admin/CreateCommitteeModal";

// Backend stores status as lowercase: "open", "assigned", "in_progress", "resolved"
const isResolved = (s) =>
  String(s || "").toLowerCase().replace(/_/g, " ") === "resolved" ||
  String(s || "").toLowerCase() === "closed";

const normalizeStatus = (s) => {
  const v = String(s || "").toLowerCase();
  if (v === "open") return "Open";
  if (v === "assigned") return "Assigned";
  if (v === "in_progress" || v === "in progress") return "In Progress";
  if (v === "resolved" || v === "closed") return "Resolved";
  return s || "Open";
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [committeeModal, setCommitteeModal] = useState(false);
  const { backendRole } = useAuthStore();
  const isPureAdmin = String(backendRole || "").toLowerCase() === "admin";

  const fetchResidents = useResidentStore((state) => state.fetchResidents);
  const fetchFlats = useApartmentStore((state) => state.fetchFlats);
  const fetchComplaints = useComplaintStore((state) => state.fetchComplaints);
  const fetchVisitorLogs = useVisitorStore((state) => state.fetchVisitorLogs);
  const fetchBills = useBillingStore((state) => state.fetchBills);
  const fetchBillingSummary = useBillingStore((state) => state.fetchBillingSummary);

  useEffect(() => {
    fetchResidents();
    fetchFlats();
    fetchComplaints();
    fetchVisitorLogs();
    fetchBills();
    fetchBillingSummary();
  }, [fetchResidents, fetchFlats, fetchComplaints, fetchVisitorLogs, fetchBills, fetchBillingSummary]);

  const flats = useApartmentStore((state) => state.flats);
  const residents = useResidentStore((state) => state.residents);
  const complaints = useComplaintStore((state) => state.complaints);
  const logs = useVisitorStore((state) => state.logs);
  const bills = useBillingStore((state) => state.bills);
  const summary = useBillingStore((state) => state.summary);

  const totalRevenue = useMemo(() => {
    // Prefer billing summary from backend if available
    if (summary?.total_collected != null) return Number(summary.total_collected);
    if (summary?.total_paid != null) return Number(summary.total_paid);
    return bills
      .filter((bill) => {
        const s = String(bill.status || "").toLowerCase();
        return s === "paid";
      })
      .reduce(
        (sum, bill) =>
          sum + Number(bill.total_amount || bill.amount || 0),
        0
      );
  }, [bills, summary]);

  const openComplaints = useMemo(
    () =>
      complaints.filter((c) => !isResolved(c.status)).length,
    [complaints]
  );

  const stats = useMemo(
    () => [
      { id: 1, title: "Residents", value: residents.length },
      { id: 2, title: "Apartments", value: flats.length },
      { id: 3, title: "Open Complaints", value: openComplaints },
      {
        id: 4,
        title: "Revenue",
        value: `₹${totalRevenue.toLocaleString()}`,
      },
    ],
    [residents.length, flats.length, openComplaints, totalRevenue]
  );

  const complaintStatus = useMemo(
    () => [
      {
        name: "Open",
        value: complaints.filter(
          (c) => String(c.status || "").toLowerCase() === "open"
        ).length,
      },
      {
        name: "Assigned",
        value: complaints.filter(
          (c) => String(c.status || "").toLowerCase() === "assigned"
        ).length,
      },
      {
        name: "In Progress",
        value: complaints.filter(
          (c) =>
            String(c.status || "").toLowerCase() === "in_progress" ||
            String(c.status || "").toLowerCase() === "in progress"
        ).length,
      },
      {
        name: "Resolved",
        value: complaints.filter((c) => isResolved(c.status)).length,
      },
    ],
    [complaints]
  );

  const monthlyComplaints = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(currentYear, i).toLocaleString("default", {
        month: "short",
      }),
      complaints: 0,
    }));

    complaints.forEach((complaint) => {
      const dateStr = complaint.created_at || complaint.createdAt;
      if (!dateStr) return;
      const d = new Date(dateStr);
      if (d.getFullYear() === currentYear) {
        months[d.getMonth()].complaints++;
      }
    });

    return months;
  }, [complaints]);

  const recentComplaints = useMemo(
    () =>
      [...complaints]
        .sort(
          (a, b) =>
            new Date(b.created_at || b.createdAt || 0) -
            new Date(a.created_at || a.createdAt || 0)
        )
        .slice(0, 5)
        .map((c) => ({
          ...c,
          title: c.title || (c.description || "").slice(0, 40),
          resident:
            c.resident_name ||
            c.resident ||
            `Resident #${c.resident_id}`,
          flat: c.flat_number || c.flat || "—",
          status: normalizeStatus(c.statusValue || c.status),
        })),
    [complaints]
  );

  const recentVisitors = useMemo(() => {
    const today = new Date().toDateString();
    return [...logs]
      .filter((log) => {
        if (!log.entry_time) return false;
        return new Date(log.entry_time).toDateString() === today;
      })
      .sort(
        (a, b) =>
          new Date(b.entry_time || 0) - new Date(a.entry_time || 0)
      )
      .slice(0, 5)
      .map((log) => ({
        id: log.log_id || log.id,
        name:
          log.visitor_name ||
          (log.visitor && log.visitor.visitor_name) ||
          `Visitor #${log.visitor_id}`,
        flat:
          log.flat_number ||
          (log.visitor && log.visitor.flat_number) ||
          `Flat #${log.flat_id}`,
        visitTime: log.entry_time
          ? new Date(log.entry_time).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "N/A",
      }));
  }, [logs]);

  const complaintColumns = [
    { key: "resident", header: "Resident" },
    { key: "flat", header: "Flat" },
    { key: "title", header: "Issue" },
    {
      key: "status",
      header: "Status",
      render: (row) => {
        const variants = {
          Open: "danger",
          Assigned: "primary",
          "In Progress": "warning",
          Resolved: "success",
        };
        return (
          <Badge variant={variants[row.status] || "default"}>
            {row.status}
          </Badge>
        );
      },
    },
  ];

  const visitorColumns = [
    { key: "name", header: "Visitor" },
    { key: "flat", header: "Resident Flat" },
    { key: "visitTime", header: "Arrival Time" },
  ];

  return (
    <Layout
      title="Dashboard"
      breadcrumb={["Home", "Dashboard"]}
    >
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <StatCard key={item.id} title={item.title} value={item.value} />
        ))}
      </div>

      <div className="mt-8">
        <QuickActions
          onAddResident={
            String(backendRole || "").toLowerCase() === "committee"
              ? () => navigate("/admin/residents")
              : undefined
          }
          onBookFacility={() => navigate("/admin/facilities")}
          onRaiseComplaint={() => navigate("/admin/complaints")}
          onAddCommittee={
            isPureAdmin ? () => setCommitteeModal(true) : undefined
          }
        />
      </div>

      {/* Committee creation modal — Admin only */}
      <CreateCommitteeModal
        open={committeeModal}
        onClose={() => setCommitteeModal(false)}
      />

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <ComplaintStatusChart data={complaintStatus} />
        <ComplaintTrendChart data={monthlyComplaints} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <Card
          title="Recent Complaints"
          subtitle="Latest maintenance requests"
        >
          <Table columns={complaintColumns} data={recentComplaints} />
        </Card>

        <Card
          title="Today's Visitors"
          subtitle="Visitor entries from today"
        >
          <Table columns={visitorColumns} data={recentVisitors} />
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;