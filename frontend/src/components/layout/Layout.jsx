import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import AiAssistant from "../ai/AiAssistant";
import useAuthStore from "../../store/authStore";
import { ShieldAlert } from "lucide-react";

const Layout = ({
  children,
  title = "Dashboard",
  breadcrumb = ["Home", "Dashboard"],
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, role, isVerified } = useAuthStore();

  const showVerificationBanner = role === "resident" && (isVerified === false || user?.isVerified === false);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative transition-colors duration-200">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 dark:bg-black/70 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main Content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Navigation */}
        <Topbar
          title={title}
          breadcrumb={breadcrumb}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto overflow-x-hidden">
          {showVerificationBanner && (
            <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Account Pending Verification</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Your residency profile is currently unverified. Raising complaints, pre-registering visitors, booking facilities, and voting will be enabled once a Committee member verifies your account.
                  </p>
                </div>
              </div>
            </div>
          )}
          {children}
        </main>
      </div>

      <AiAssistant />
    </div>
  );
};

export default Layout;
