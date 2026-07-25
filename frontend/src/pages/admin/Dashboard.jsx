import { useMemo } from "react";
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

const Dashboard = () => {
  const navigate = useNavigate();

  const apartments = useApartmentStore(
    (state) => state.apartments
  );

  const residents = useResidentStore(
    (state) => state.residents
  );

  const complaints = useComplaintStore(
    (state) => state.complaints
  );

  const visitors = useVisitorStore(
    (state) => state.visitors
  );

  const bills = useBillingStore(
    (state) => state.bills
  );

  const totalRevenue = useMemo(
    () =>
      bills
        .filter(
          (bill) =>
            bill.status === "Paid"
        )
        .reduce(
          (sum, bill) =>
            sum +
            Number(
              bill.amount || 0
            ),
          0
        ),
    [bills]
  );

  const openComplaints =
    useMemo(
      () =>
        complaints.filter(
          (complaint) =>
            complaint.status !==
            "Resolved"
        ).length,
      [complaints]
    );

  const stats = useMemo(
    () => [
      {
        id: 1,
        title: "Residents",
        value: residents.length,
      },
      {
        id: 2,
        title: "Apartments",
        value: apartments.length,
      },
      {
        id: 3,
        title:
          "Open Complaints",
        value: openComplaints,
      },
      {
        id: 4,
        title: "Revenue",
        value: `₹${totalRevenue.toLocaleString()}`,
      },
    ],
    [
      residents.length,
      apartments.length,
      openComplaints,
      totalRevenue,
    ]
  );

  const complaintStatus =
    useMemo(
      () => [
        {
          name: "Open",
          value:
            complaints.filter(
              (c) =>
                c.status ===
                "Open"
            ).length,
        },
        {
          name: "Assigned",
          value:
            complaints.filter(
              (c) =>
                c.status ===
                "Assigned"
            ).length,
        },
        {
          name: "In Progress",
          value:
            complaints.filter(
              (c) =>
                c.status ===
                "In Progress"
            ).length,
        },
        {
          name: "Resolved",
          value:
            complaints.filter(
              (c) =>
                c.status ===
                "Resolved"
            ).length,
        },
      ],
      [complaints]
    );

  const monthlyComplaints =
    useMemo(() => {
      const currentYear =
        new Date().getFullYear();

      const months =
        Array.from(
          {
            length: 12,
          },
          (_, i) => ({
            month: new Date(
              currentYear,
              i
            ).toLocaleString(
              "default",
              {
                month: "short",
              }
            ),
            complaints: 0,
          })
        );

      complaints.forEach(
        (complaint) => {
          if (
            !complaint.createdAt
          )
            return;

          const month =
            new Date(
              complaint.createdAt
            ).getMonth();

          months[
            month
          ].complaints++;
        }
      );

      return months;
    }, [complaints]);
      const recentComplaints =
    useMemo(
      () =>
        [...complaints]
          .sort(
            (a, b) =>
              new Date(
                b.createdAt || 0
              ) -
              new Date(
                a.createdAt || 0
              )
          )
          .slice(0, 5),
      [complaints]
    );

  const recentVisitors =
    useMemo(
      () =>
        [...visitors]
          .sort(
            (a, b) =>
              new Date(
                b.createdAt || 0
              ) -
              new Date(
                a.createdAt || 0
              )
          )
          .slice(0, 5),
      [visitors]
    );

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
        let variant =
          "default";

        switch (row.status) {
          case "Open":
            variant =
              "danger";
            break;

          case "Assigned":
            variant =
              "primary";
            break;

          case "In Progress":
            variant =
              "warning";
            break;

          case "Resolved":
            variant =
              "success";
            break;

          default:
            variant =
              "default";
        }

        return (
          <Badge
            variant={variant}
          >
            {row.status}
          </Badge>
        );
      },
    },
  ];

  const visitorColumns = [
    {
      key: "name",
      header: "Visitor",
    },
    {
      key: "flat",
      header:
        "Resident Flat",
    },
    {
      key: "visitTime",
      header:
        "Arrival Time",
    },
  ];

  return (
    <Layout
      title="Dashboard"
      breadcrumb={[
        "Home",
        "Dashboard",
      ]}
    >
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <StatCard
            key={item.id}
            title={item.title}
            value={item.value}
          />
        ))}
      </div>

      <div className="mt-8">
        <QuickActions
          onRaiseComplaint={() =>
            navigate(
              "/admin/complaints"
            )
          }
          onAddResident={() =>
            navigate(
              "/admin/residents"
            )
          }
          onRegisterVisitor={() =>
            navigate(
              "/admin/visitors"
            )
          }
          onBookFacility={() =>
            navigate(
              "/admin/bookings"
            )
          }
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <ComplaintStatusChart
          data={
            complaintStatus
          }
        />

        <ComplaintTrendChart
          data={
            monthlyComplaints
          }
        />
      </div>
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