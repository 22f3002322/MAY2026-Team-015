import React, { useState, useMemo } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Pagination from "../../components/ui/Pagination";
import EmptyState from "../../components/empty/EmptyState";
import useVisitorStore from "../../store/visitorStore";
import { toast } from "sonner";
import { Search, ShieldAlert, CheckCircle, XCircle, LogIn, LogOut, Eye } from "lucide-react";

const VisitorVerification = () => {
  const { visitors, updateVisitor } = useVisitorStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const handleAction = (id, newStatus, message) => {
    updateVisitor(id, { status: newStatus });
    toast.success(message);
  };

  const filteredVisitors = useMemo(() => {
    return visitors.filter((v) => {
      const matchesSearch = 
        (v.name && v.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (v.phone && v.phone.includes(searchTerm)) ||
        (v.flat && v.flat.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === "All" || v.status === statusFilter;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
  }, [visitors, searchTerm, statusFilter]);

  // Pagination calculations
  const totalItems = filteredVisitors.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedVisitors = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredVisitors.slice(start, start + pageSize);
  }, [filteredVisitors, currentPage]);

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "Approved": return "success";
      case "Rejected": return "danger";
      case "Expected": return "warning";
      case "Checked In": return "primary";
      case "Checked Out": return "secondary";
      default: return "default";
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
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 flex-shrink-0">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="w-full md:w-48 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent dark:bg-slate-800 dark:text-slate-100 py-2.5 px-3 text-sm outline-none transition focus:border-indigo-600 dark:focus:border-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="Expected">Expected</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Checked In">Checked In</option>
              <option value="Checked Out">Checked Out</option>
            </select>
          </div>
        </div>

        {/* Visitors Card Grid */}
        {totalItems === 0 ? (
          <EmptyState
            icon={ShieldAlert}
            title="No Visitors Found"
            description="Try adjusting your search criteria or filters."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedVisitors.map((visitor) => (
              <Card key={visitor.id} className="flex flex-col justify-between h-full space-y-4">
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
                      <span className="text-slate-600 dark:text-slate-400">{visitor.date}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">Arrival Time</span>
                      <span className="text-slate-600 dark:text-slate-400">{visitor.time || "N/A"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  {visitor.status === "Expected" && (
                    <>
                      <Button
                        size="sm"
                        className="flex-1 min-w-[80px]"
                        onClick={() => handleAction(visitor.id, "Approved", "Visitor access APPROVED")}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 min-w-[80px] text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                        onClick={() => handleAction(visitor.id, "Rejected", "Visitor access REJECTED")}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {visitor.status === "Approved" && (
                    <Button
                      size="sm"
                      className="w-full flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => handleAction(visitor.id, "Checked In", "Visitor checked IN")}
                    >
                      <LogIn size={15} /> Check In
                    </Button>
                  )}
                  {visitor.status === "Checked In" && (
                    <Button
                      size="sm"
                      className="w-full flex items-center justify-center gap-1 bg-slate-600 hover:bg-slate-700 text-white"
                      onClick={() => handleAction(visitor.id, "Checked Out", "Visitor checked OUT")}
                    >
                      <LogOut size={15} /> Check Out
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>
    </Layout>
  );
};

export default VisitorVerification;
