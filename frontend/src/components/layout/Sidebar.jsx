import {
  LayoutDashboard,
  Building2,
  Users,
  ClipboardList,
  UserRoundCheck,
  CalendarDays,
  Megaphone,
  Vote,
  ReceiptIndianRupee,
  X,
  LogOut,
  User,
  Shield,
  Wrench,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

// Admin menu — matches backend Modules 1-9
const adminMenuItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
  { title: "Apartments", icon: Building2, path: "/admin/apartments" },
  { title: "Residents", icon: Users, path: "/admin/residents" },
  { title: "Complaints", icon: ClipboardList, path: "/admin/complaints" },
  { title: "Visitors", icon: UserRoundCheck, path: "/admin/visitors" },
  { title: "Facility Booking", icon: CalendarDays, path: "/admin/facilities" },
  { title: "Billing", icon: ReceiptIndianRupee, path: "/admin/billing" },
  { title: "Notice Board", icon: Megaphone, path: "/admin/notices" },
  { title: "Polls", icon: Vote, path: "/admin/polls" },
];

// Resident menu — matches backend Modules 1-9
const residentMenuItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/resident/dashboard" },
  { title: "Bills", icon: ReceiptIndianRupee, path: "/resident/billing" },
  { title: "Complaints", icon: ClipboardList, path: "/resident/complaints" },
  { title: "Facilities", icon: Building2, path: "/resident/facilities" },
  { title: "Notices", icon: Megaphone, path: "/resident/notices" },
  { title: "Polls", icon: Vote, path: "/resident/polls" },
  { title: "Visitors", icon: UserRoundCheck, path: "/resident/visitors" },
  { title: "Profile", icon: User, path: "/resident/profile" },
];

// Security staff menu — Module 5 (Visitor Management)
const securityMenuItems = [
  { title: "Verify Visitors", icon: Shield, path: "/staff/visitors" },
];

// Maintenance staff menu — Module 4 (Maintenance Tasks)
const maintenanceMenuItems = [
  { title: "Assigned Complaints", icon: Wrench, path: "/staff/complaints" },
];

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, role, backendRole, logout } = useAuthStore();
  const navigate = useNavigate();

  const getMenuItems = () => {
    if (role === "admin") return adminMenuItems;
    if (role === "resident") return residentMenuItems;
    if (role === "staff") {
      const staffRole = user?.staffRole;
      if (staffRole === "security") return securityMenuItems;
      if (staffRole === "maintenance") return maintenanceMenuItems;
      // Default staff gets both options
      return [...securityMenuItems, ...maintenanceMenuItems.slice(1)];
    }
    return [];
  };

  const menuItems = getMenuItems();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };

  return (
    <aside 
      className={`fixed lg:static inset-y-0 left-0 z-50 w-72 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Logo */}
      <div className="px-6 py-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            Neighbourly
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Smart Community Management
          </p>
        </div>
        
        {/* Close Button Mobile */}
        <button 
          className="lg:hidden p-1 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          onClick={() => setIsOpen(false)}
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-5 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`
              }
            >
              <Icon size={20} />
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-slate-200 dark:border-slate-800 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold">
              {getInitials(user?.name)}
            </div>
            <div className="overflow-hidden">
              <h3 className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                {user?.name || "User"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                {backendRole || role || "Guest"}
              </p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;