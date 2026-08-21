import { useState, useEffect, useMemo } from "react";

import Layout from "../../components/layout/Layout";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";

import VisitorStats from "../../components/visitors/VisitorStats";
import VisitorFilters from "../../components/visitors/VisitorFilters";
import VisitorTable from "../../components/visitors/VisitorTable";
import VisitorDetails from "../../components/visitors/VisitorDetails";
import VisitorPurposeChart from "../../components/visitors/VisitorPurposeChart";
import VisitorTrendChart from "../../components/visitors/VisitorTrendChart";

import useVisitorStore from "../../store/visitorStore";

const STATUS_LABEL = {
  expected: "Expected",
  pre_registered: "Expected",
  arrived: "Arrived",
  denied: "Denied",
  departed: "Departed",
};

const statusVariant = (status) => {
  const v = String(status || "").toLowerCase();
  if (v === "expected" || v === "pre_registered") return "warning";
  if (v === "arrived") return "primary";
  if (v === "denied") return "danger";
  if (v === "departed") return "success";
  return "default";
};

const Visitors = () => {
  const logs = useVisitorStore((state) => state.logs);
  const allRequests = useVisitorStore((state) => state.allRequests);
  const fetchVisitorLogs = useVisitorStore((state) => state.fetchVisitorLogs);
  const fetchAllVisitorRequests = useVisitorStore(
    (state) => state.fetchAllVisitorRequests
  );

  useEffect(() => {
    fetchVisitorLogs();
    fetchAllVisitorRequests();
  }, [fetchVisitorLogs, fetchAllVisitorRequests]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");
  const [selectedVisitor, setSelectedVisitor] = useState(null);

  const preRegistered = useMemo(() => {
    return (allRequests || [])
      .filter((r) => {
        const s = String(r.status || "").toLowerCase();
        return s === "expected" || s === "denied" || s === "pre_registered";
      })
      .map((r) => {
        const statusValue = String(r.status || "expected").toLowerCase();
        return {
          id: r.request_id,
          name: r.visitor_name || `Visitor #${r.visitor_id}`,
          phone: r.visitor_phone || "N/A",
          flat: r.flat_number
            ? `${r.block_name ? `${r.block_name} · ` : ""}Flat ${r.flat_number}`
            : `Resident #${r.resident_id}`,
          resident: r.resident_name || "—",
          purpose: r.visitor_type || "Guest",
          status: STATUS_LABEL[statusValue] || statusValue,
          statusValue,
          date: r.expected_date || "N/A",
          visitTime: r.expected_time || "N/A",
          otp: null,
        };
      });
  }, [allRequests]);

  const mappedVisitors = useMemo(() => {
    return logs.map((log) => ({
      id: log.log_id || log.id,
      name: log.visitor_name || `Visitor #${log.visitor_id || log.log_id}`,
      phone: log.visitor_phone || "N/A",
      resident: log.resident_name || `Resident #${log.resident_id}`,
      flat: log.flat_number
        ? `Flat ${log.flat_number}`
        : `Flat #${log.flat_id || log.resident_id}`,
      purpose: log.visitor_type || "Guest",
      status: log.exit_time ? "Completed" : "Checked In",
      date: log.entry_time
        ? new Date(log.entry_time).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
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
    <Layout title="Visitor Management Log" breadcrumb={["Home", "Visitors"]}>
      <VisitorStats />

      <div className="mb-6 grid gap-6 xl:grid-cols-2">
        <VisitorPurposeChart />
        <VisitorTrendChart />
      </div>

      <Card
        className="mb-6"
        title="Pre-registered / Expected"
        subtitle="Visitor requests from residents (before gate check-in)"
      >
        {preRegistered.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            No expected or denied visitor requests.
          </p>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {preRegistered.map((row) => (
              <div
                key={row.id}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">
                    {row.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {row.phone} · {row.purpose} · Host: {row.resident} ·{" "}
                    {row.flat}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {row.date} · {row.visitTime}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={statusVariant(row.statusValue)}>
                    {row.status}
                  </Badge>
                  <button
                    type="button"
                    className="text-sm font-medium text-indigo-600 hover:underline"
                    onClick={() => setSelectedVisitor(row)}
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <VisitorFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        date={date}
        setDate={setDate}
      />

      <VisitorTable visitors={filteredVisitors} onView={setSelectedVisitor} />

      <VisitorDetails
        visitor={selectedVisitor}
        onClose={() => setSelectedVisitor(null)}
      />
    </Layout>
  );
};

export default Visitors;
