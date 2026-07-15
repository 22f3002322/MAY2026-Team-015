import React, { useState, useMemo } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Input from "../../components/ui/Input";
import Pagination from "../../components/ui/Pagination";
import EmptyState from "../../components/empty/EmptyState";
import useComplaintStore from "../../store/complaintStore";
import useAuthStore from "../../store/authStore";
import { Search, Wrench, CheckCircle } from "lucide-react";

const CompletedJobs = () => {
  const { complaints } = useComplaintStore();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const filteredJobs = useMemo(() => {
    return complaints.filter((c) => {
      // Filter only jobs resolved or closed by this staff
      const isAssigned = c.assignedTo === user?.name || c.assignedTo?.toLowerCase() === "maintenance team";
      const isResolved = c.status === "Resolved" || c.status === "Closed";
      if (!isAssigned || !isResolved) return false;

      return (
        (c.title && c.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.category && c.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.resident && c.resident.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }).sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
  }, [complaints, searchTerm, user]);

  const totalItems = filteredJobs.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredJobs.slice(start, start + pageSize);
  }, [filteredJobs, currentPage]);

  const getPriorityBadgeVariant = (priority) => {
    switch (priority) {
      case "High": return "danger";
      case "Medium": return "warning";
      default: return "default";
    }
  };

  return (
    <Layout title="Completed Jobs" breadcrumb={["Staff", "Completed Jobs"]}>
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Search by title, resident..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent dark:bg-slate-800 dark:text-slate-100 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-600 dark:focus:border-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>
        </div>

        {totalItems === 0 ? (
          <EmptyState
            icon={CheckCircle}
            title="No Completed Jobs"
            description="You haven't resolved any complaints yet."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedJobs.map((job) => (
              <Card key={job.id} className="flex flex-col justify-between h-full space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-800 dark:text-white leading-snug">{job.title}</h3>
                    <div className="flex flex-col gap-1 items-end flex-shrink-0">
                      <Badge variant={getPriorityBadgeVariant(job.priority)}>{job.priority}</Badge>
                      <Badge variant="success">{job.status}</Badge>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 line-clamp-2">
                    {job.description}
                  </p>

                  {job.resolutionNotes && (
                    <div className="mt-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800">
                      <span className="font-semibold block text-slate-700 dark:text-slate-300 mb-0.5">Resolution details:</span>
                      {job.resolutionNotes}
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <div>
                      <span className="block text-slate-400">Resident / Flat</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{job.resident} ({job.flat})</span>
                    </div>
                    <div>
                      <span className="block text-slate-400">Completed Date</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{new Date(job.updatedAt || job.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
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

export default CompletedJobs;
