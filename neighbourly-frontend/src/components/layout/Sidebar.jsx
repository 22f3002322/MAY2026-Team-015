import {
  LayoutDashboard,
  Building2,
  Users,
  ClipboardList,
  UserRoundCheck,
  CalendarDays,
  Megaphone,
  FolderOpen,
  Vote,
  FileBarChart2,
  ReceiptIndianRupee,
  BriefcaseBusiness,
  Settings,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const menuItems = [
  // Dashboard
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },

  // Society Management
  {
    title: "Apartments",
    icon: Building2,
    path: "/apartments",
  },
  {
    title: "Residents",
    icon: Users,
    path: "/residents",
  },
  {
    title: "Complaints",
    icon: ClipboardList,
    path: "/complaints",
  },
  {
    title: "Visitors",
    icon: UserRoundCheck,
    path: "/visitors",
  },

  // Operations
  {
    title: "Facility Booking",
    icon: CalendarDays,
    path: "/bookings",
  },
  {
    title: "Billing",
    icon: ReceiptIndianRupee,
    path: "/billing",
  },
  {
    title: "Notice Board",
    icon: Megaphone,
    path: "/notices",
  },

  // Coming Modules
  {
    title: "Documents",
    icon: FolderOpen,
    path: "/documents",
  },
  {
    title: "Polls",
    icon: Vote,
    path: "/polls",
  },
  {
    title: "Reports",
    icon: FileBarChart2,
    path: "/reports",
  },

  // Administration
  {
    title: "Staff",
    icon: Users,
    path: "/staff",
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/settings",
  },
];

import { X } from "lucide-react"; // add X for close button

const Sidebar = ({ isOpen, setIsOpen }) => {
  return (
    <aside 
      className={`fixed lg:static inset-y-0 left-0 z-50 w-72 h-screen bg-white border-r border-slate-200 flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >

      {/* Logo */}

      <div className="px-6 py-6 border-b border-slate-200 flex justify-between items-center">

        <div>
          <h1 className="text-2xl font-bold text-indigo-600">
            Neighbourly
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Smart Community Management
          </p>
        </div>
        
        {/* Close Button Mobile */}
        <button 
          className="lg:hidden p-1 rounded-md text-slate-500 hover:bg-slate-100"
          onClick={() => setIsOpen(false)}
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
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-600 hover:bg-slate-100"
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

      <div className="border-t border-slate-200 p-5">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-600">
            JD
          </div>

          <div>

            <h3 className="font-medium text-slate-800">
              John Doe
            </h3>

            <p className="text-xs text-slate-500">
              Committee Admin
            </p>

          </div>

        </div>

      </div>

    </aside>
  );
};

export default Sidebar;