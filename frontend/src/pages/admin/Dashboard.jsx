import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Building2,
  MessageSquareWarning,
  IndianRupee,
} from "lucide-react";

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

// Backend stores status as lowercase:
// "open", "assigned", "in_progress", "resolved"
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

  const normalizedRole = String(backendRole || "").toLowerCase();

  const isPureAdmin = normalizedRole === "admin";
  const isCommittee = normalizedRole === "committee";

  // --------------------------------------------------
  // Store actions
  // --------------------------------------------------

  const fetchResidents = useResidentStore(
    (state) => state.fetchResidents
  );

  const fetchFlats = useApartmentStore(
    (state) => state.fetchFlats
  );

  const fetchComplaints = useComplaintStore(
    (state) => state.fetchComplaints
  );

  const fetchVisitorLogs = useVisitorStore(
    (state) => state.fetchVisitorLogs
  );

  const fetchBills = useBillingStore(
    (state) => state.fetchBills
  );

  const fetchBillingSummary = useBillingStore(
    (state) => state.fetchBillingSummary
  );

  // --------------------------------------------------
  // Fetch dashboard data
  // --------------------------------------------------

  useEffect(() => {
    fetchResidents();
    fetchFlats();
    fetchComplaints();
    fetchVisitorLogs();
    fetchBills();
    fetchBillingSummary();
  }, [
    fetchResidents,
    fetchFlats,
    fetchComplaints,
    fetchVisitorLogs,
    fetchBills,
    fetchBillingSummary,
  ]);

  // --------------------------------------------------
  // Store data
  // --------------------------------------------------

  const flats = useApartmentStore((state) => state.flats);
  const residents = useResidentStore((state) => state.residents);
  const complaints = useComplaintStore((state) => state.complaints);
  const logs = useVisitorStore((state) => state.logs);
  const bills = useBillingStore((state) => state.bills);
  const summary = useBillingStore((state) => state.summary);

  // --------------------------------------------------
  // Revenue
  // --------------------------------------------------

  const totalRevenue = useMemo(() => {
    // Prefer billing summary from backend if available
    if (summary?.total_collected != null) {
      return Number(summary.total_collected);
    }

    if (summary?.total_paid != null) {
      return Number(summary.total_paid);
    }

    return bills
      .filter((bill) => {
        const status = String(bill.status || "").toLowerCase();
        return status === "paid";
      })
      .reduce(
        (sum, bill) =>
          sum + Number(bill.total_amount || bill.amount || 0),
        0
      );
  }, [bills, summary]);

  // --------------------------------------------------
  // Open complaints
  // --------------------------------------------------

  const openComplaints = useMemo(
    () =>
      complaints.filter(
        (complaint) => !isResolved(complaint.status)
      ).length,
    [complaints]
  );

  // --------------------------------------------------
  // Dashboard statistics
  // --------------------------------------------------

  const stats = useMemo(
    () => [
      {
        id: 1,
        title: "Residents",
        value: residents.length,
        icon: Users,
        iconColor:
          "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
      },
      {
        id: 2,
        title: "Apartments",
        value: flats.length,
        icon: Building2,
        iconColor:
          "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
      },
      {
        id: 3,
        title: "Open Complaints",
        value: openComplaints,
        icon: MessageSquareWarning,
        iconColor:
          "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
      },
      {
        id: 4,
        title: "Revenue",
        value: `₹${totalRevenue.toLocaleString("en-IN")}`,
        icon: IndianRupee,
        iconColor:
          "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
      },
    ],
    [
      residents.length,
      flats.length,
      openComplaints,
      totalRevenue,
    ]
  );

  // --------------------------------------------------
  // Complaint status chart
  // --------------------------------------------------

  const complaintStatus = useMemo(
    () => [
      {
        name: "Open",
        value: complaints.filter(
          (complaint) =>
            String(complaint.status || "").toLowerCase() ===
            "open"
        ).length,
      },
      {
        name: "Assigned",
        value: complaints.filter(
          (complaint) =>
            String(complaint.status || "").toLowerCase() ===
            "assigned"
        ).length,
      },
      {
        name: "In Progress",
        value: complaints.filter((complaint) => {
          const status = String(
            complaint.status || ""
          ).toLowerCase();

          return (
            status === "in_progress" ||
            status === "in progress"
          );
        }).length,
      },
      {
        name: "Resolved",
        value: complaints.filter(
          (complaint) => isResolved(complaint.status)
        ).length,
      },
    ],
    [complaints]
  );

  // --------------------------------------------------
  // Monthly complaints
  // --------------------------------------------------

  const monthlyComplaints = useMemo(() => {
    const currentYear = new Date().getFullYear();

    const months = Array.from({ length: 12 }, (_, index) => ({
      month: new Date(
        currentYear,
        index
      ).toLocaleString("default", {
        month: "short",
      }),
      complaints: 0,
    }));

    complaints.forEach((complaint) => {
      const dateStr =
        complaint.created_at || complaint.createdAt;

      if (!dateStr) return;

      const date = new Date(dateStr);

      if (date.getFullYear() === currentYear) {
        months[date.getMonth()].complaints++;
      }
    });

    return months;
  }, [complaints]);

  // --------------------------------------------------
  // Recent complaints
  // --------------------------------------------------

  const recentComplaints = useMemo(
    () =>
      [...complaints]
        .sort(
          (a, b) =>
            new Date(
              b.created_at || b.createdAt || 0
            ) -
            new Date(
              a.created_at || a.createdAt || 0
            )
        )
        .slice(0, 5)
        .map((complaint) => ({
          ...complaint,

          title:
            complaint.title ||
            (complaint.description || "").slice(0, 40),

          resident:
            complaint.resident_name ||
            complaint.resident ||
            `Resident #${complaint.resident_id}`,

          flat:
            complaint.flat_number ||
            complaint.flat ||
            "—",

          status: normalizeStatus(
            complaint.statusValue || complaint.status
          ),
        })),
    [complaints]
  );

  // --------------------------------------------------
  // Today's visitors
  // --------------------------------------------------

  const recentVisitors = useMemo(() => {
    const today = new Date().toDateString();

    return [...logs]
      .filter((log) => {
        if (!log.entry_time) return false;

        return (
          new Date(log.entry_time).toDateString() ===
          today
        );
      })
      .sort(
        (a, b) =>
          new Date(b.entry_time || 0) -
          new Date(a.entry_time || 0)
      )
      .slice(0, 5)
      .map((log) => ({
        id: log.log_id || log.id,

        name:
          log.visitor_name ||
          (log.visitor &&
            log.visitor.visitor_name) ||
          `Visitor #${log.visitor_id}`,

        flat:
          log.flat_number ||
          (log.visitor &&
            log.visitor.flat_number) ||
          `Flat #${log.flat_id}`,

        visitTime: log.entry_time
          ? new Date(
              log.entry_time
            ).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "N/A",
      }));
  }, [logs]);

  // --------------------------------------------------
  // Complaint table columns
  // --------------------------------------------------

  const complaintColumns = [
    {
      key: "resident",
      header: "Resident",
    },
    {
      key: "flat",
      header: "Flat",
    },
    {
      key: "title",
      header: "Issue",
    },
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
          <Badge
            variant={
              variants[row.status] || "default"
            }
          >
            {row.status}
          </Badge>
        );
      },
    },
  ];

  // --------------------------------------------------
  // Visitor table columns
  // --------------------------------------------------

  const visitorColumns = [
    {
      key: "name",
      header: "Visitor",
    },
    {
      key: "flat",
      header: "Resident Flat",
    },
    {
      key: "visitTime",
      header: "Arrival Time",
    },
  ];

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <Layout
      title="Dashboard"
      breadcrumb={["Home", "Dashboard"]}
    >
      {/* --------------------------------------------- */}
      {/* Dashboard Stats */}
      {/* --------------------------------------------- */}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <StatCard
            key={item.id}
            title={item.title}
            value={item.value}
            icon={item.icon}
            iconColor={item.iconColor}
          />
        ))}
      </div>

      {/* --------------------------------------------- */}
      {/* Quick Actions */}
      {/* --------------------------------------------- */}

      <div className="mt-8">
        <QuickActions
          onAddResident={
            isCommittee
              ? () => navigate("/admin/residents")
              : undefined
          }
          onBookFacility={() =>
            navigate("/admin/facilities")
          }
          onRaiseComplaint={() =>
            navigate("/admin/complaints")
          }
          onAddCommittee={
            isPureAdmin
              ? () => setCommitteeModal(true)
              : undefined
          }
        />
      </div>

      {/* --------------------------------------------- */}
      {/* Committee Modal */}
      {/* --------------------------------------------- */}

      <CreateCommitteeModal
        open={committeeModal}
        onClose={() => setCommitteeModal(false)}
      />

      {/* --------------------------------------------- */}
      {/* Charts */}
      {/* --------------------------------------------- */}

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <ComplaintStatusChart
          data={complaintStatus}
        />

        <ComplaintTrendChart
          data={monthlyComplaints}
        />
      </div>

      {/* --------------------------------------------- */}
      {/* Recent Data */}
      {/* --------------------------------------------- */}

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        {/* Recent Complaints */}

        <Card
          title="Recent Complaints"
          subtitle="Latest maintenance requests"
        >
          <Table
            columns={complaintColumns}
            data={recentComplaints}
          />
        </Card>

        {/* Today's Visitors */}

        <Card
          title="Today's Visitors"
          subtitle="Visitor entries from today"
        >
          <Table
            columns={visitorColumns}
            data={recentVisitors}
          />
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
