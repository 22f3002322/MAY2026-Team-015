import { useState, useEffect, useRef } from "react";
import {
  Bell,
  Menu,
  ChevronRight,
  CheckCheck,
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import useNoticeStore from "../../store/noticeStore";

const NOTIFICATION_TYPE_STYLES = {
  announcement: "bg-indigo-50 dark:bg-indigo-950/40",
  bill_generated: "bg-amber-50 dark:bg-amber-950/40",
  payment_success: "bg-emerald-50 dark:bg-emerald-950/40",
  complaint_update: "bg-orange-50 dark:bg-orange-950/40",
  booking_update: "bg-blue-50 dark:bg-blue-950/40",
  visitor_arrival: "bg-violet-50 dark:bg-violet-950/40",
  account_verified: "bg-green-50 dark:bg-green-950/40",
  poll: "bg-pink-50 dark:bg-pink-950/40",
};

const Topbar = ({ title = "Dashboard", breadcrumb = [], onMenuClick }) => {
  const { user, role, backendRole } = useAuthStore();
  const { notifications, unreadCount, fetchNotifications, markRead, markAllRead } = useNoticeStore();

  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch notifications on mount and poll every 30s
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBellClick = () => {
    setShowNotifications((prev) => !prev);
  };

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markRead(notification.notification_id);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  // Show latest 10 notifications
  const displayNotifications = notifications.slice(0, 10);

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

        {/* Notification Bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={handleBellClick}
            className="relative rounded-xl border border-slate-200 dark:border-slate-800 p-3 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute right-2 top-2 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-14 z-50 w-96 max-h-[70vh] rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="inline-flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllRead()}
                    className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium transition-colors"
                  >
                    <CheckCheck size={14} />
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="overflow-y-auto max-h-[55vh] divide-y divide-slate-100 dark:divide-slate-800">
                {displayNotifications.length === 0 ? (
                  <div className="px-4 py-10 text-center">
                    <Bell size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      No notifications yet
                    </p>
                  </div>
                ) : (
                  displayNotifications.map((n) => (
                    <button
                      key={n.notification_id}
                      onClick={() => handleNotificationClick(n)}
                      className={`w-full text-left px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                        !n.is_read ? "bg-indigo-50/50 dark:bg-indigo-950/20" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {!n.is_read && (
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                        )}
                        <div className={`flex-1 ${n.is_read ? "ml-5" : ""}`}>
                          <div className={`rounded-lg px-2 py-1 inline-block text-[10px] font-semibold uppercase tracking-wider mb-1 ${
                            NOTIFICATION_TYPE_STYLES[n.notification_type] || "bg-slate-100 dark:bg-slate-800"
                          } text-slate-600 dark:text-slate-300`}>
                            {(n.notification_type || "general").replace(/_/g, " ")}
                          </div>
                          <p className={`text-sm ${!n.is_read ? "font-semibold text-slate-800 dark:text-slate-100" : "text-slate-600 dark:text-slate-300"}`}>
                            {n.message || n.title || "Notification"}
                          </p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                            {formatTime(n.created_at)}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
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
              {backendRole || role || "Guest"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
