import React, { useState, useMemo, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/empty/EmptyState";
import useVisitorStore from "../../store/visitorStore";
import { toast } from "sonner";
import { Search, ShieldAlert, LogIn, LogOut, Key, RefreshCw } from "lucide-react";

const getStatusBadgeVariant = (status) => {
  switch (status) {
    case "Expected": return "warning";
    case "Checked In": return "primary";
    case "Completed": return "success";
    case "Cancelled": return "danger";
    default: return "default";
  }
};

const VisitorVerification = () => {
  const { visitors, logs, fetchVisitorLogs, verifyOtp, logExit, loading } = useVisitorStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // OTP verification modal state
  const [otpModal, setOtpModal] = useState(false);
  const [otpTarget, setOtpTarget] = useState(null);  // visitor request
  const [otpValue, setOtpValue] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  useEffect(() => {
    fetchVisitorLogs();
  }, []);

  // Merge visitor logs (checked-in records) with visitor requests for display
  // Logs have log_id and show active/departed visitors
  const allEntries = useMemo(() => {
    // Show logs (actual check-ins) and requests with "pre_registered" / "Expected" status
    const logEntries = logs.map((log) => ({
      id: log.log_id,
      request_id: log.request_id,
      name: log.visitor_name || `Visitor #${log.log_id}`,
      phone: log.visitor_phone || "",
      flat: log.flat_number || `Flat #${log.flat_id}`,
      purpose: log.visitor_type || "Guest",
      date: log.entry_time ? log.entry_time.split("T")[0] : "",
      visitTime: log.entry_time
        ? new Date(log.entry_time).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "N/A",
      status: log.exit_time ? "Completed" : "Checked In",
      log_id: log.log_id,
      isLog: true,
    }));

    // Requests not yet checked in (still Expected / pre_registered)
    const requestEntries = visitors
      .filter((v) => v.status === "Expected")
      .map((v) => ({
        id: v.id,
        request_id: v.id,
        name: v.name,
        phone: v.phone,
        flat: v.flat,
        purpose: v.purpose,
        date: v.date,
        visitTime: v.visitTime,
        status: v.status,
        otp: v.otp,
        isLog: false,
      }));

    return [...requestEntries, ...logEntries];
  }, [visitors, logs]);

  const filteredEntries = useMemo(() => {
    return allEntries
      .filter((v) => {
        const matchesSearch =
          (v.name && v.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (v.phone && v.phone.includes(searchTerm)) ||
          (v.flat && v.flat.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === "All" || v.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [allEntries, searchTerm, statusFilter]);

  const totalItems = filteredEntries.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEntries.slice(start, start + pageSize);
  }, [filteredEntries, currentPage]);

  // OTP verify → check-in
  const handleOpenOtpModal = (visitor) => {
    setOtpTarget(visitor);
    setOtpValue("");
    setOtpModal(true);
  };

  const handleVerifyOtp = async () => {
    if (!otpTarget || !otpValue.trim()) {
      toast.error("Please enter the OTP");
      return;
    }
    setOtpLoading(true);
    const res = await verifyOtp(otpTarget.request_id, otpValue.trim());
    setOtpLoading(false);
    if (res.success) {
      toast.success(`${otpTarget.name} checked in successfully!`);
      setOtpModal(false);
      setOtpTarget(null);
      setOtpValue("");
      fetchVisitorLogs();
    } else {
      toast.error(res.message || "Invalid OTP. Please try again.");
    }
  };

  // Exit log
  const handleCheckOut = async (visitor) => {
    if (!visitor.log_id) {
      toast.error("Cannot log exit: Log ID not found.");
      return;
    }
    const res = await logExit(visitor.log_id);
    if (res.success) {
      toast.success(`${visitor.name} checked out successfully!`);
      fetchVisitorLogs();
    } else {
      toast.error(res.message || "Check-out failed.");
    }
  };

  return (
    <Layout title="Visitor Verification" breadcrumb={["Staff", "Visitor Verification"]}>
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Search by name, phone, flat..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent dark:bg-slate-800 dark:text-slate-100 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-600 dark:focus:border-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 flex-shrink-0">
              Status:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="w-full md:w-48 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent dark:bg-slate-800 dark:text-slate-100 py-2.5 px-3 text-sm outline-none transition focus:border-indigo-600 dark:focus:border-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="Expected">Expected</option>
              <option value="Checked In">Checked In</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={() => fetchVisitorLogs()}
              loading={loading}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Visitor Cards */}
        {totalItems === 0 ? (
          <EmptyState
            icon={ShieldAlert}
            title="No Visitors Found"
            description="No visitor records match the current filters."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedEntries.map((visitor) => (
              <Card key={`${visitor.isLog ? "log" : "req"}-${visitor.id}`} className="flex flex-col justify-between h-full space-y-4">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-slate-800 dark:text-white">{visitor.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{visitor.phone}</p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(visitor.status)}>
                      {visitor.status}
                    </Badge>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm border-t border-slate-100 dark:border-slate-800 pt-3">
                    <div>
                      <span className="text-xs text-slate-400 block">Flat Target</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{visitor.flat}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">Purpose</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 truncate block">{visitor.purpose}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">Scheduled Date</span>
                      <span className="text-slate-600 dark:text-slate-400">{visitor.date || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">Arrival Time</span>
                      <span className="text-slate-600 dark:text-slate-400">{visitor.visitTime || "N/A"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  {visitor.status === "Expected" && (
                    <Button
                      size="sm"
                      className="flex-1 min-w-[80px] flex items-center justify-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                      onClick={() => handleOpenOtpModal(visitor)}
                    >
                      <Key size={14} /> Verify OTP & Check In
                    </Button>
                  )}
                  {visitor.status === "Checked In" && (
                    <Button
                      size="sm"
                      className="w-full flex items-center justify-center gap-1 bg-slate-600 hover:bg-slate-700 text-white"
                      onClick={() => handleCheckOut(visitor)}
                    >
                      <LogOut size={15} /> Check Out
                    </Button>
                  )}
                  {(visitor.status === "Completed" || visitor.status === "Cancelled") && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 w-full text-center py-1">
                      Visit {visitor.status.toLowerCase()}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Page {currentPage} of {totalPages} ({totalItems} records)
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* OTP Verification Modal */}
      <Modal
        open={otpModal}
        title="Verify Visitor OTP"
        onClose={() => { setOtpModal(false); setOtpTarget(null); setOtpValue(""); }}
      >
        {otpTarget && (
          <div className="space-y-5">
            <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950/40 p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">Visitor</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">{otpTarget.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">Flat</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">{otpTarget.flat}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">Purpose</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">{otpTarget.purpose}</span>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Enter OTP (resident receives OTP during pre-registration)
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ""))}
                placeholder="e.g. 123456"
                className="h-12 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-4 outline-none focus:border-indigo-600 text-center text-xl tracking-widest font-bold"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setOtpModal(false); setOtpValue(""); }}>
                Cancel
              </Button>
              <Button
                loading={otpLoading}
                onClick={handleVerifyOtp}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {otpLoading ? "Verifying..." : "Verify & Check In"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default VisitorVerification;
