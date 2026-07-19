import React, { useMemo } from "react";
import Layout from "../../components/layout/Layout";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import useAuthStore from "../../store/authStore";
import useStaffDashboardStore from "../../store/staffDashboardStore";
import useVisitorStore from "../../store/visitorStore";
import useComplaintStore from "../../store/complaintStore";
import { 
  Shield, 
  Wrench, 
  Sparkles, 
  Calendar, 
  Bell, 
  Clock, 
  FileText, 
  Truck, 
  AlertTriangle,
  ClipboardList,
  CheckCircle2,
  Users
} from "lucide-react";

const StaffDashboard = () => {
  const { user } = useAuthStore();
  const staffRole = user?.staffRole || "security"; // default to security if not specified

  const { schedule, activities, notifications, deliveries, incidents, cleaningTasks } = useStaffDashboardStore();
  const { visitors } = useVisitorStore();
  const { complaints } = useComplaintStore();

  const todayStr = new Date().toISOString().split("T")[0];

  // Helper to dynamically calculate schedule status based on current time
  const deriveScheduleStatus = (timeRange) => {
    if (!timeRange) return "upcoming";
    const parts = timeRange.split("-").map((p) => p.trim());
    if (parts.length !== 2) return "upcoming";

    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentMinsTotal = currentHours * 60 + currentMinutes;

    const parseTime = (tStr) => {
      const isPM = tStr.toUpperCase().includes("PM");
      const isAM = tStr.toUpperCase().includes("AM");
      let [h, m] = tStr.replace(/(AM|PM)/gi, "").trim().split(":").map(Number);
      if (isNaN(h)) h = 0;
      if (isNaN(m)) m = 0;
      if (isPM && h < 12) h += 12;
      if (isAM && h === 12) h = 0;
      return h * 60 + m;
    };

    const startMins = parseTime(parts[0]);
    const endMins = parseTime(parts[1]);

    if (currentMinsTotal < startMins) {
      return "upcoming";
    } else if (currentMinsTotal >= startMins && currentMinsTotal <= endMins) {
      return "active";
    } else {
      return "completed";
    }
  };

  // Filter and derive status for schedule items assigned to this specific staff member
  const filteredSchedule = useMemo(() => {
    const staffName = (user?.name || "").toLowerCase();
    return schedule
      .filter((item) => {
        const assignedName = (item.assignedTo || "").toLowerCase();
        return !item.assignedTo || assignedName === staffName || staffName.includes(assignedName) || assignedName.includes(staffName);
      })
      .map((item) => ({
        ...item,
        status: deriveScheduleStatus(item.time),
      }));
  }, [schedule, user]);

  // Derive stats based on role
  const stats = useMemo(() => {
    if (staffRole === "security") {
      const todayVisitors = visitors.filter(v => v.date && v.date.startsWith(todayStr)).length;
      const expectedVisitors = visitors.filter(v => v.status === "Expected").length;
      const pendingDeliveries = deliveries.filter(d => d.status === "Pending").length;
      const activeIncidents = incidents.filter(i => i.status === "Open").length;

      return [
        { title: "Visitors Today", value: todayVisitors, icon: Users, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50" },
        { title: "Expected Visitors", value: expectedVisitors, icon: Shield, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/50" },
        { title: "Pending Deliveries", value: pendingDeliveries, icon: Truck, color: "text-sky-600 bg-sky-50 dark:bg-sky-950/50" },
        { title: "Open Incidents", value: activeIncidents, icon: AlertTriangle, color: "text-red-600 bg-red-50 dark:bg-red-950/50" }
      ];
    } else if (staffRole === "maintenance") {
      const openComplaints = complaints.filter(c => c.status === "Open").length;
      const assignedComplaints = complaints.filter(c => c.status === "Assigned" || c.status === "In Progress").length;
      const resolvedToday = complaints.filter(c => c.status === "Resolved" && c.updatedAt && c.updatedAt.startsWith(todayStr)).length;

      return [
        { title: "Open Complaints", value: openComplaints, icon: ClipboardList, color: "text-red-600 bg-red-50 dark:bg-red-950/50" },
        { title: "Assigned Jobs", value: assignedComplaints, icon: Wrench, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50" },
        { title: "Resolved Today", value: resolvedToday, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50" },
        { title: "Avg. Resolution Time", value: "2.5 hrs", icon: Clock, color: "text-sky-600 bg-sky-50 dark:bg-sky-950/50" }
      ];
    } else { // housekeeping
      const totalTasks = cleaningTasks.length;
      const completedTasks = cleaningTasks.filter(t => t.status === "Completed").length;
      const pendingTasks = cleaningTasks.filter(t => t.status === "Pending").length;

      return [
        { title: "Total Tasks Today", value: totalTasks, icon: ClipboardList, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50" },
        { title: "Completed Tasks", value: completedTasks, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50" },
        { title: "Pending Tasks", value: pendingTasks, icon: Clock, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/50" },
        { title: "Staff Attendance", value: "95%", icon: Users, color: "text-sky-600 bg-sky-50 dark:bg-sky-950/50" }
      ];
    }
  }, [staffRole, visitors, deliveries, incidents, complaints, cleaningTasks, todayStr]);

  const roleName = {
    security: "Security Officer",
    maintenance: "Maintenance Specialist",
    housekeeping: "Housekeeping Lead"
  }[staffRole] || "Staff Member";

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

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
                  <h4 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{stat.value}</h4>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Schedule */}
          <Card title="Today's Schedule" className="xl:col-span-2">
            {filteredSchedule.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 py-4">No tasks scheduled for today.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredSchedule.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock size={12} /> {item.time}
                        </p>
                      </div>
                    </div>
                    <Badge variant={item.status === "active" ? "primary" : item.status === "completed" ? "success" : "default"} className="capitalize">
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Notifications & Recent Activity */}
          <Card 
            title="Recent Activities" 
            action={
              unreadNotificationsCount > 0 && (
                <Badge variant="danger" className="font-semibold">
                  {unreadNotificationsCount} New Alerts
                </Badge>
              )
            }
          >
            {activities.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 py-4">No recent activity.</p>
            ) : (
              <div className="space-y-4">
                {activities.slice(0, 5).map((act) => (
                  <div key={act.id} className="flex gap-3 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{act.action}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{act.details}</p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">{act.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default StaffDashboard;
