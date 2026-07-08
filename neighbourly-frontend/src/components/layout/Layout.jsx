import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const Layout = ({
  children,
  title = "Dashboard",
  breadcrumb = ["Home", "Dashboard"],
}) => {
  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* Sidebar */}

      <Sidebar />

      {/* Main Content */}

      <div className="flex flex-1 flex-col">

        {/* Top Navigation */}

        <Topbar
          title={title}
          breadcrumb={breadcrumb}
        />

        {/* Page Content */}

        <main className="flex-1 p-8 overflow-y-auto">

          {children}

        </main>

      </div>

    </div>
  );
};

export default Layout;