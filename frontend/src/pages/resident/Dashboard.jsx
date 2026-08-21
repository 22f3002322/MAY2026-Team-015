import { useEffect } from "react";
import Layout from "../../components/layout/Layout";

import ResidentStats from "../../components/residents/dashboard/ResidentStats";
import ComplaintOverview from "../../components/residents/dashboard/ComplaintOverview";
import UpcomingBills from "../../components/residents/dashboard/UpcomingBills";
import VisitorOverview from "../../components/residents/dashboard/VisistorOverview";
import NoticeOverview from "../../components/residents/dashboard/NoticeOverview";
import FacilityBookings from "../../components/residents/dashboard/FacilityBookings";
import QuickActions from "../../components/residents/dashboard/QuickActions";

import useComplaintStore from "../../store/complaintStore";
import useBillingStore from "../../store/billingStore";
import useVisitorStore from "../../store/visitorStore";
import useNoticeStore from "../../store/noticeStore";
import useBookingStore from "../../store/bookingStore";

const Dashboard = () => {
  const fetchComplaints = useComplaintStore((s) => s.fetchComplaints);
  const fetchMyBills = useBillingStore((s) => s.fetchMyBills);
  const fetchMyPayments = useBillingStore((s) => s.fetchMyPayments);
  const fetchVisitorRequests = useVisitorStore((s) => s.fetchVisitorRequests);
  const fetchAnnouncements = useNoticeStore((s) => s.fetchAnnouncements);
  const fetchBookings = useBookingStore((s) => s.fetchBookings);

  useEffect(() => {
    fetchComplaints();
    fetchMyBills();
    fetchMyPayments();
    fetchVisitorRequests();
    fetchAnnouncements(false); // residents see only active
    fetchBookings();
  }, []);

  return (
    <Layout
      title="Resident Dashboard"
      breadcrumb={["Resident", "Dashboard"]}
    >
      {/* Statistics */}
      <ResidentStats />

      <div className="mt-8">
        <QuickActions />
      </div>

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