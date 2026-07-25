import React, { useState, useMemo } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Input from "../../components/ui/Input";
import Pagination from "../../components/ui/Pagination";
import EmptyState from "../../components/empty/EmptyState";
import useComplaintStore from "../../store/complaintStore";
import useAuthStore from "../../store/authStore";
import { Search, Wrench } from "lucide-react";

const MaintenanceHistory = () => {
  const { complaints } = useComplaintStore();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const filteredHistory = useMemo(() => {
    return complaints.filter((c) => {
      // Filter history assigned to this maintenance operator
      const staffName = (user?.name || "").toLowerCase();
      const assignedName = (c.assignedTo || "").toLowerCase();
      const isAssigned = assignedName === staffName || 
                         (assignedName && staffName.includes(assignedName)) || 
                         (staffName && assignedName.includes(staffName)) ||
                         (user?.staffRole === "maintenance" && assignedName === "maintenance team");
      if (!isAssigned) return false;

      const matchesSearch = 
        (c.title && c.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.resident && c.resident.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.category && c.category.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === "All" || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [complaints, searchTerm, statusFilter, user]);

  const totalItems = filteredHistory.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedHistory = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredHistory.slice(start, start + pageSize);
  }, [filteredHistory, currentPage]);

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "Open": return "warning";
      case "Assigned": return "info";
      case "In Progress": return "primary";
      case "Resolved": return "success";
      case "Closed": return "secondary";
      default: return "default";
    }
  };

  const getPriorityBadgeVariant = (priority) => {
    switch (priority) {
      case "High": return "danger";
      case "Medium": return "warning";
      default: return "default";
    }
  };

  return (
    <Layout title="Maintenance History" breadcrumb={["Staff", "Maintenance History"]}>
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Search by title, resident, flat..."
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
              <option value="Open">Open</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        {totalItems === 0 ? (
          <EmptyState
            icon={Wrench}
            title="No Records Found"
            description="No complaint logs exist for you under this search/filter."
          />
        ) : (
          <Card className="overflow-hidden" padding="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Complaint</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Resident</th>
                    <th className="px-6 py-4">Priority</th>
                    <th className="px-6 py-4">Logged Date</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {paginatedHistory.map((complaint) => (
                    <tr key={complaint.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                      <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">{complaint.title}</td>
                      <td className="px-6 py-4">{complaint.category}</td>
                      <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-350">{complaint.resident} ({complaint.flat})</td>
                      <td className="px-6 py-4">
                        <Badge variant={getPriorityBadgeVariant(complaint.priority)}>{complaint.priority}</Badge>
                      </td>
                      <td className="px-6 py-4">{new Date(complaint.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        <Badge variant={getStatusBadgeVariant(complaint.status)}>{complaint.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
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

export default MaintenanceHistory;
