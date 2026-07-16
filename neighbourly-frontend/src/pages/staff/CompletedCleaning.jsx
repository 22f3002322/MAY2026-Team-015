import React, { useState, useMemo } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Input from "../../components/ui/Input";
import Pagination from "../../components/ui/Pagination";
import EmptyState from "../../components/empty/EmptyState";
import useStaffDashboardStore from "../../store/staffDashboardStore";
import useAuthStore from "../../store/authStore";
import { Search, Sparkles } from "lucide-react";

const CompletedCleaning = () => {
  const { cleaningTasks } = useStaffDashboardStore();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const completedTasks = useMemo(() => {
    return cleaningTasks.filter((t) => {
      const matchesUser = t.assignedTo === user?.name || t.assignedTo?.toLowerCase() === "geeta" || t.assignedTo?.toLowerCase() === "ramu" || t.assignedTo?.toLowerCase() === "sita" || t.assignedTo?.toLowerCase() === "geeta devi";
      if (!matchesUser || t.status !== "Completed") return false;

      return (
        (t.area && t.area.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.floor && t.floor.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.assignedTo && t.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }).sort((a, b) => new Date(b.completedAt || b.scheduledDate) - new Date(a.completedAt || a.scheduledDate));
  }, [cleaningTasks, searchTerm, user]);

  const totalItems = completedTasks.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedTasks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return completedTasks.slice(start, start + pageSize);
  }, [completedTasks, currentPage]);

  const getTypeBadgeVariant = (type) => {
    switch (type) {
      case "Deep Clean": return "warning";
      case "Sanitization": return "danger";
      default: return "default";
    }
  };

  return (
    <Layout title="Completed Tasks" breadcrumb={["Staff", "Completed Cleaning"]}>
      <div className="space-y-6">
        <div className="flex bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Search area..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent dark:bg-slate-800 dark:text-slate-100 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-600 dark:focus:border-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>
        </div>

        {totalItems === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No Completed Cleaning"
            description="No cleaning tasks have been completed yet."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedTasks.map((task) => (
              <Card key={task.id} className="flex flex-col justify-between h-full space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-white leading-snug">{task.area}</h3>
                      <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">{task.floor}</span>
                    </div>
                    <Badge variant={getTypeBadgeVariant(task.type)}>{task.type}</Badge>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <div>
                      <span className="block text-slate-400">Scheduled</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{task.scheduledDate} {task.scheduledTime}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400">Completed At</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-450">{task.completedAt ? new Date(task.completedAt).toLocaleString() : "N/A"}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-slate-400">Assigned Operator</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">{task.assignedTo}</span>
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

export default CompletedCleaning;
