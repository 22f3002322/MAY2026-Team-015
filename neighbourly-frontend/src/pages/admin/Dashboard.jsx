import Layout from "../../components/layout/Layout";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Table from "../../components/ui/Table";

import StatCard from "../../components/dashboard/StatCard";
import QuickActions from "../../components/dashboard/QuickActions";
import ComplaintStatusChart from "../../components/dashboard/ComplaintStatusChart";
import ComplaintTrendChart from "../../components/dashboard/ComplaintTrendChart";

import {
  stats,
  recentComplaints,
  recentVisitors,
  complaintStatus,
  monthlyComplaints,
} from "../../mock/dashboard";

const Dashboard = () => {
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
      key: "issue",
      header: "Issue",
    },
    {
      key: "status",
      header: "Status",
      render: (row) => {
        let variant = "default";

        switch (row.status) {
          case "Open":
            variant = "danger";
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
          <Badge variant={variant}>
            {row.status}
          </Badge>
        );
      },
    },
  ];

  const visitorColumns = [
    {
      key: "visitor",
      header: "Visitor",
    },
    {
      key: "resident",
      header: "Resident Flat",
    },
    {
      key: "time",
      header: "Arrival Time",
    },
  ];

  return (
    <Layout
      title="Dashboard"
      breadcrumb={["Home", "Dashboard"]}
    >
      {/* Statistics */}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <StatCard
            key={item.id}
            title={item.title}
            value={item.value}
            change={item.change}
            trend={item.trend}
          />
        ))}
      </div>

      {/* Quick Actions */}

      <div className="mt-8">
        <QuickActions />
      </div>

      {/* Charts */}

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <ComplaintStatusChart
          data={complaintStatus}
        />

        <ComplaintTrendChart
          data={monthlyComplaints}
        />
      </div>

      {/* Tables */}

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <Card
          title="Recent Complaints"
          subtitle="Latest maintenance requests"
        >
          <Table
            columns={complaintColumns}
            data={recentComplaints}
          />
        </Card>

        <Card
          title="Today's Visitors"
          subtitle="Latest visitor entries"
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