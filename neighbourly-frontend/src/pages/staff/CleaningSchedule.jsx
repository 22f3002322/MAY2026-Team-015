import React, { useMemo } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/empty/EmptyState";
import useStaffDashboardStore from "../../store/staffDashboardStore";
import useAuthStore from "../../store/authStore";
import { Sparkles, Calendar, Clock } from "lucide-react";

const CleaningSchedule = () => {
  const { cleaningTasks } = useStaffDashboardStore();
  const { user } = useAuthStore();

  const sortedSchedule = useMemo(() => {
    return cleaningTasks.filter((t) => {
      const staffName = (user?.name || "").toLowerCase();
      const assignedName = (t.assignedTo || "").toLowerCase();
      return staffName === assignedName || 
             (assignedName && staffName.includes(assignedName)) || 
             (staffName && assignedName.includes(assignedName));
    }).sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  }, [cleaningTasks, user]);

  const getStatusBorderColor = (status) => {
    switch (status) {
      case "Completed": return "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10";
      case "In Progress": return "border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/10";
      default: return "border-amber-500 bg-amber-50/20 dark:bg-amber-950/10";
    }
  };

  const getTypeBadgeVariant = (type) => {
    switch (type) {
      case "Deep Clean": return "warning";
      case "Sanitization": return "danger";
      default: return "default";
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "Completed": return "success";
      case "In Progress": return "primary";
      default: return "warning";
    }
  };

  return (
    <Layout title="Cleaning Schedule" breadcrumb={["Staff", "Cleaning Schedule"]}>
      <div className="space-y-6">
        {sortedSchedule.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No Scheduled Cleaning"
            description="You have no tasks scheduled."
          />
        ) : (
          <Card title="Timeline View" subtitle="Housekeeping schedules ordered by time slots">
            <div className="relative border-l border-slate-200 dark:border-slate-800 ml-4 md:ml-24 space-y-6 mt-4 py-2">
              {sortedSchedule.map((task) => (
                <div key={task.id} className="relative pl-6 md:pl-8">
                  {/* Time badge indicator on left for desktop view */}
                  <div className="hidden md:flex absolute -left-28 top-0 w-24 justify-end text-sm font-semibold text-slate-500 dark:text-slate-400 gap-1 items-center">
                    <Clock size={14} /> {task.scheduledTime}
                  </div>
                  
                  {/* Timeline dot */}
                  <span className="absolute -left-1.5 top-1.5 flex h-3 w-3 rounded-full bg-indigo-600 ring-4 ring-white dark:ring-slate-900" />
                  
                  {/* Task Card Box */}
                  <div className={`p-4 rounded-xl border-l-4 border-y border-r border-slate-200 dark:border-slate-800 ${getStatusBorderColor(task.status)}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="md:hidden text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                          Slot: {task.scheduledTime}
                        </span>
                        <h4 className="font-bold text-slate-800 dark:text-white text-base">{task.area}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{task.floor}</p>
                      </div>
                      <div className="flex gap-2.5 items-center">
                        <Badge variant={getTypeBadgeVariant(task.type)}>{task.type}</Badge>
                        <Badge variant={getStatusBadgeVariant(task.status)}>{task.status}</Badge>
                      </div>
                    </div>
                    {task.notes && (
                      <p className="text-xs text-slate-500 dark:text-slate-450 italic mt-3 bg-white/40 dark:bg-slate-900/40 p-2 rounded-lg">
                        Instruction: {task.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default CleaningSchedule;
