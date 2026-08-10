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
  const { logs, fetchVisitorLogs, loading: visitorsLoading } = useVisitorStore();

  // Fetch data on mount from backend
  useEffect(() => {
    if (staffRole === "maintenance") {
      fetchMyTasks();
    } else if (staffRole === "security") {
      fetchVisitorLogs();
    }
  }, [staffRole]);

  const stats = useMemo(() => {
    if (staffRole === "security") {
      const arrivedToday = logs.filter(l => l.entry_time && l.entry_time.startsWith(new Date().toISOString().split("T")[0])).length;
      const checkedOutToday = logs.filter(l => l.exit_time && l.exit_time.startsWith(new Date().toISOString().split("T")[0])).length;
      const totalLogs = logs.length;
      
      return [
        { title: "Checked In Today", value: arrivedToday, icon: Users, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50" },
        { title: "Checked Out Today", value: checkedOutToday, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50" },
        { title: "Total Logs", value: totalLogs, icon: Shield, color: "text-sky-600 bg-sky-50 dark:bg-sky-950/50" },
      ];
    } else {
      // Maintenance
      const acceptedTasks = tasks.filter(t => t.status === "accepted").length;
      const inProgressTasks = tasks.filter(t => t.status === "in_progress").length;
      const completedTasks = tasks.filter(t => t.status === "completed").length;

      return [
        { title: "Pending Tasks", value: acceptedTasks, icon: ClipboardList, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/50" },
        { title: "In Progress", value: inProgressTasks, icon: PlayCircle, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50" },
        { title: "Completed", value: completedTasks, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50" },
        { title: "Total Tasks", value: tasks.length, icon: Wrench, color: "text-sky-600 bg-sky-50 dark:bg-sky-950/50" },
      ];
    }
  }, [staffRole, logs, tasks]);

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
        <Card title={staffRole === "maintenance" ? "Your Recent Tasks" : "Recent Visitor Activity Logs"}>
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
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        task.status === "completed" ? "success" :
                        task.status === "in_progress" ? "primary" : "warning"
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
            logs.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 py-4">No visitor logs found.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {logs.slice(0, 8).map((log) => (
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
                          Flat: {log.flat_number || log.flat_id} • Purpose: {log.visitor_type || "Guest"}
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
      </div>
    </Layout>
  );
};

export default StaffDashboard;
