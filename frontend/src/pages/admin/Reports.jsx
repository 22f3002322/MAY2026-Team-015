import { useEffect } from "react";

import Layout from "../../components/layout/Layout";

import ReportStats from "../../components/reports/ReportStats";
import ReportFilters from "../../components/reports/ReportFilters";

import RevenueChart from "../../components/reports/RevenueChart";
import ComplaintChart from "../../components/reports/ComplaintChart";
import OccupancyChart from "../../components/reports/OccupancyChart";
import VisitorChart from "../../components/reports/VisitorChart";
import BillingChart from "../../components/reports/BillingChart";
import PollChart from "../../components/reports/PollChart";

import ExportReports from "../../components/reports/ExportReports";

import useReportStore from "../../store/reportStore";

const Reports = () => {
  return (
    <Layout
      title="Reports & Analytics"
      breadcrumb={["Home", "Reports"]}
    >
      <ReportStats />

      <ReportFilters />

      <div className="mb-6 grid gap-6 xl:grid-cols-2">
        <RevenueChart />

        <ComplaintChart />

        <OccupancyChart />

        <VisitorChart />

        <BillingChart />

        <PollChart />
      </div>

      <ExportReports />
    </Layout>
  );
};

export default Reports;