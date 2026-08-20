import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";

import Layout from "../../components/layout/Layout";

import VisitorStats from "../../components/visitors/VisitorStats";
import VisitorFilters from "../../components/visitors/VisitorFilters";
import VisitorTable from "../../components/visitors/VisitorTable";
import VisitorDetails from "../../components/visitors/VisitorDetails";
import VisitorPurposeChart from "../../components/visitors/VisitorPurposeChart";
import VisitorTrendChart from "../../components/visitors/VisitorTrendChart";

import useVisitorStore from "../../store/visitorStore";

const Visitors = () => {
  const logs = useVisitorStore((state) => state.logs);
  const fetchVisitorLogs = useVisitorStore((state) => state.fetchVisitorLogs);

  useEffect(() => {
    fetchVisitorLogs();
  }, [fetchVisitorLogs]);

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");

  const [selectedVisitor, setSelectedVisitor] = useState(null);

  // Map backend logs to table format
  const mappedVisitors = useMemo(() => {
    return logs.map((log) => ({
      id: log.log_id || log.id,
      name: log.visitor_name || `Visitor #${log.visitor_id || log.log_id}`,
      phone: log.visitor_phone || "N/A",
      resident: log.resident_name || `Resident #${log.resident_id}`,
      flat: log.flat_number ? `Flat ${log.flat_number}` : `Flat #${log.flat_id || log.resident_id}`,
      purpose: log.visitor_type || "Guest",
      status: log.exit_time ? "Completed" : "Checked In",
      date: log.entry_time
        ? new Date(log.entry_time).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        : "N/A",
      checkIn: log.entry_time
        ? new Date(log.entry_time).toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "N/A",
      checkOut: log.exit_time
        ? new Date(log.exit_time).toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "N/A",
    }));
  }, [logs]);

  const filteredVisitors = useMemo(() => {
    return mappedVisitors.filter((visitor) => {
      const matchesSearch =
        (visitor.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (visitor.resident || "").toLowerCase().includes(search.toLowerCase()) ||
        (visitor.flat || "").toLowerCase().includes(search.toLowerCase()) ||
        (visitor.phone || "").includes(search);
      const matchesStatus = status === "" || visitor.status === status;
      const matchesDate =
        date === "" ||
        visitor.date === new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [mappedVisitors, search, status, date]);

  return (
    <Layout
      title="Visitor Management Log"
      breadcrumb={["Home", "Visitors"]}
    >
      <VisitorStats />

      <div className="mb-6 grid gap-6 xl:grid-cols-2">
        <VisitorPurposeChart />
        <VisitorTrendChart />
      </div>

      <VisitorFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        date={date}
        setDate={setDate}
      />

      <VisitorTable
        visitors={filteredVisitors}
        onView={setSelectedVisitor}
      />

      {/* Details */}
      <VisitorDetails
        visitor={selectedVisitor}
        onClose={() => setSelectedVisitor(null)}
      />
    </Layout>
  );
};

export default Visitors;