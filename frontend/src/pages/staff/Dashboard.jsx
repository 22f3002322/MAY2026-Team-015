import React, { useEffect, useMemo } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import useAuthStore from "../../store/authStore";
import useMaintenanceStore from "../../store/maintenanceStore";
import useVisitorStore from "../../store/visitorStore";
import { 
  Shield, 
  Wrench, 
  Clock, 
  ClipboardList,
  CheckCircle2,
  Users,
  UserRoundCheck,
  PlayCircle,
} from "lucide-react";

const StaffDashboard = () => {
  const { user } = useAuthStore();
  const staffRole = user?.staffRole || "security";

  const { tasks, fetchMyTasks, loading: tasksLoading } = useMaintenanceStore();
  const {
    myLogs,
    allRequests,
    fetchMyVisitorLogs,
    fetchAllVisitorRequests,
    loading: visitorsLoading,
  } = useVisitorStore();

  // Fetch data on mount from backend
  useEffect(() => {
    if (staffRole === "maintenance") {
      fetchMyTasks();
    } else if (staffRole === "security") {
      fetchMyVisitorLogs();
      fetchAllVisitorRequests();
    }
  }, [staffRole]);

  const stats = useMemo(() => {
    if (staffRole === "security") {
      const todayStr = new Date().toISOString().split("T")[0];
      const expectedToday = (allRequests || []).filter(
        (r) => String(r.status || "").toLowerCase() === "expected"
      ).length;
      const onPremises = myLogs.filter((l) => l.entry_time && !l.exit_time).length;
      const arrivedToday = myLogs.filter(l => l.entry_time && l.entry_time.startsWith(todayStr)).length;
      const checkedOutToday = myLogs.filter(l => l.exit_time && l.exit_time.startsWith(todayStr)).length;

      return [
        { title: "Expected Visitors", value: expectedToday, icon: UserRoundCheck, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/50" },
        { title: "On Premises", value: onPremises, icon: Shield, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50" },
        { title: "Checked In Today", value: arrivedToday, icon: Users, color: "text-sky-600 bg-sky-50 dark:bg-sky-950/50" },
        { title: "Checked Out Today", value: checkedOutToday, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50" },
      ];
    } else {
      // Maintenance -- "assigned" needs an accept/decline response before
      // anything else in the task lifecycle can move (see Module 4 doc).
      const assignedTasks = tasks.filter(t => t.status === "assigned").length;
      const acceptedTasks = tasks.filter(t => t.status === "accepted").length;
      const inProgressTasks = tasks.filter(t => t.status === "in_progress").length;
      const completedTasks = tasks.filter(t => t.status === "completed").length;

      return [
        { title: "Needs Response", value: assignedTasks, icon: ClipboardList, color: "text-red-600 bg-red-50 dark:bg-red-950/50" },
        { title: "Accepted", value: acceptedTasks, icon: PlayCircle, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/50" },
        { title: "In Progress", value: inProgressTasks, icon: Wrench, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50" },
        { title: "Completed", value: completedTasks, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50" },
      ];
    }
  }, [staffRole, allRequests, myLogs, tasks]);

  // Gap-fill: previously there was no way for a maintenance staff member
  // to see feedback/ratings residents left on their completed work.
  const ratedTasks = useMemo(() => {
    if (staffRole !== "maintenance") return [];
    return tasks
      .filter((t) => t.resident_rating != null)
      .sort((a, b) => new Date(b.completed_at || 0) - new Date(a.completed_at || 0));
  }, [staffRole, tasks]);

  const roleName = {
    security: "Security Officer",
    maintenance: "Maintenance Specialist",
  }[staffRole] || "Staff Member";

  const loading = staffRole === "maintenance" ? tasksLoading : visitorsLoading;

  return (
    <Layout title="Dashboard" breadcrumb={["Staff", "Dashboard"]}>
      <div className="space-y-6">
        {/* Welcome Card */}
        <Card className="overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-none p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Welcome back, {user?.name || "Staff Member"}!</h2>
              <p className="mt-1 text-indigo-100">You are logged in as {roleName} for Neighbourly Smart Community.</p>
            </div>
            <div>
              <Badge variant="primary" className="bg-white/20 text-white font-semibold capitalize border border-white/30 px-4 py-1.5 text-sm rounded-xl">
                {staffRole} Mode
              </Badge>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx} className="flex items-center gap-4 p-5">
                <div className={`p-3.5 rounded-xl ${stat.color}`}>
                  <Icon size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{stat.title}</p>
                  <h4 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
                    {loading ? "..." : stat.value}
                  </h4>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Recent Tasks / Requests */}
        <Card title={staffRole === "maintenance" ? "Your Recent Tasks" : "Recent Visitor Check-Ins"}>
          {loading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-4">Loading...</p>
          ) : staffRole === "maintenance" ? (
            tasks.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 py-4">No tasks assigned yet.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {tasks.slice(0, 8).map((task) => (
                  <div key={task.task_id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        <Wrench size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          Task #{task.task_id}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock size={12} /> Complaint #{task.complaint_id}
                          {task.complaint_category ? ` · ${task.complaint_category}` : ""}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        task.status === "completed" ? "success" :
                        task.status === "in_progress" ? "primary" :
                        task.status === "declined" ? "danger" : "warning"
                      }
                      className="capitalize"
                    >
                      {task.status?.replace("_", " ")}
                    </Badge>
                  </div>
                ))}
              </div>
            )
          ) : (
            myLogs.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 py-4">No visitor check-ins logged by you yet.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {myLogs.slice(0, 8).map((log) => (
                  <div key={log.log_id || log.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        <Users size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {log.visitor_name || `Visitor #${log.log_id}`}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Flat: {log.flat_number || "—"} • Purpose: {log.visitor_type || "Guest"}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        log.exit_time ? "success" : "warning"
                      }
                      className="capitalize"
                    >
                      {log.exit_time ? "Departed" : "Checked In"}
                    </Badge>
                  </div>
                ))}
              </div>
            )
          )}
        </Card>

        {/* Resident Feedback (maintenance only) */}
        {staffRole === "maintenance" && (
          <Card
            title="Resident Feedback"
            subtitle="Ratings and comments left on your completed work"
          >
            {ratedTasks.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 py-4">
                No feedback from residents yet.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {ratedTasks.slice(0, 8).map((task) => (
                  <div key={task.task_id} className="py-3.5 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          Complaint #{task.complaint_id}
                          {task.complaint_category ? ` · ${task.complaint_category}` : ""}
                        </h4>
                        {task.resident_feedback && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">
                            "{task.resident_feedback}"
                          </p>
                        )}
                      </div>
                      <span
                        className="shrink-0 text-sm tracking-wide text-amber-500"
                        aria-label={`Rating ${task.resident_rating} of 5`}
                      >
                        {"★".repeat(task.resident_rating)}
                        {"☆".repeat(Math.max(0, 5 - task.resident_rating))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default StaffDashboard;