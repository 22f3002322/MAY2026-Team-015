import { useState } from "react";
import {
  Bell,
  Menu,
  Search,
  ChevronRight,
} from "lucide-react";
import useAuthStore from "../../store/authStore";

const Topbar = ({ title = "Dashboard", breadcrumb = [], onMenuClick }) => {
  const { user, role } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleBellClick = () => setShowNotifications((prev) => !prev);

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 md:h-20 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 md:px-8 transition-colors duration-200">
      {/* Left Section */}
      <div className="flex items-center gap-3 md:gap-6">
        {/* Mobile Menu Button */}
        <button
          className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden text-slate-600 dark:text-slate-300"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {title}
          </h1>

          <div className="mt-1 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            {breadcrumb.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <span>{item}</span>
                {index !== breadcrumb.length - 1 && (
                  <ChevronRight size={14} className="text-slate-400" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search..."
            className="w-72 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent dark:bg-slate-800 dark:text-slate-100 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-600 dark:focus:border-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={handleBellClick}
            className="relative rounded-xl border border-slate-200 dark:border-slate-800 p-3 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            aria-label="Notifications"
          >
            <Bell size={20} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-14 z-50 w-80 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl p-4">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">Notifications</h3>
              <div className="space-y-3">
                <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950 p-3">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Maintenance scheduled</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Water supply off tomorrow 9AM-1PM</p>
                </div>
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Bill due soon</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Maintenance fee due in 3 days</p>
                </div>
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Visitor approved</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">John Smith approved for entry today</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User */}
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 text-slate-700 dark:text-slate-300">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950 font-semibold text-indigo-600 dark:text-indigo-400">
            {getInitials(user?.name)}
          </div>

          <div className="hidden lg:block">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
              {role || "Guest"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
