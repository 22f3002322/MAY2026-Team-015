import {
  Bell,
  Menu,
  Search,
  Settings,
  ChevronRight,
} from "lucide-react";

const Topbar = ({
  title = "Dashboard",
  breadcrumb = ["Home", "Dashboard"],
}) => {
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-8">

      {/* Left Section */}

      <div className="flex items-center gap-6">

        {/* Mobile Menu Button */}

        <button className="rounded-lg p-2 hover:bg-slate-100 lg:hidden">
          <Menu size={22} />
        </button>

        <div>

          <h1 className="text-2xl font-bold text-slate-800">
            {title}
          </h1>

          <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">

            {breadcrumb.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2"
              >
                <span>{item}</span>

                {index !== breadcrumb.length - 1 && (
                  <ChevronRight size={14} />
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
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search..."
            className="w-72 rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-600"
          />

        </div>

        {/* Notification */}

        <button className="relative rounded-xl border border-slate-200 p-3 hover:bg-slate-100">

          <Bell size={20} />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500"></span>

        </button>

        {/* User */}

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2">

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-600">
            JD
          </div>

          <div className="hidden lg:block">

            <p className="text-sm font-semibold text-slate-800">
              John Doe 
            </p>

            <p className="text-xs text-slate-500">
              Committee Admin
            </p>

          </div>

        </div>

      </div>

    </header>
  );
};

export default Topbar;