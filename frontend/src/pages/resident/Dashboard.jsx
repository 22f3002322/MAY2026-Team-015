import Layout from "../../components/layout/Layout";

import ResidentStats from "../../components/residents/dashboard/ResidentStats";
import ComplaintOverview from "../../components/residents/dashboard/ComplaintOverview";
import UpcomingBills from "../../components/residents/dashboard/UpcomingBills";
import VisitorOverview from "../../components/residents/dashboard/VisistorOverview";
import NoticeOverview from "../../components/residents/dashboard/NoticeOverview";
import FacilityBookings from "../../components/residents/dashboard/FacilityBookings";

const Dashboard = () => {
  return (
    <Layout
      title="Resident Dashboard"
      breadcrumb={[
        "Resident",
        "Dashboard",
      ]}
    >
      {/* Statistics */}

      <ResidentStats />

      {/* Complaints + Bills */}

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <ComplaintOverview />

        <UpcomingBills />
      </div>

      {/* Visitors + Notices */}

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <VisitorOverview />

        <NoticeOverview />
      </div>

      {/* Facility */}

      <div className="mt-8">
        <FacilityBookings />
      </div>
    </Layout>
  );
};

export default Dashboard;