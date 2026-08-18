import { Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "./store/authStore";

// Auth & Fallback pages
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import ServerError from "./pages/ServerError";

// Admin / Committee pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminResidents from "./pages/admin/Residents";
import AdminApartments from "./pages/admin/Apartments";
import AdminComplaints from "./pages/admin/Complaints";
import AdminVisitors from "./pages/admin/Visitors";
import AdminFacilities from "./pages/admin/FacilityBookings";
import AdminBilling from "./pages/admin/Billing";
import AdminNotices from "./pages/admin/Notices";
import AdminPolls from "./pages/admin/Polls";

// Resident pages
import ResidentDashboard from "./pages/resident/Dashboard";
import ResidentComplaints from "./pages/resident/Complaints";
import ResidentFacilities from "./pages/resident/Facilities";
import ResidentVisitors from "./pages/resident/Visitors";
import ResidentBilling from "./pages/resident/Bills";
import ResidentNotices from "./pages/resident/Notices";
import ResidentPolls from "./pages/resident/Polls";
import ResidentProfile from "./pages/resident/Profile";

// Staff pages (Security & Maintenance)
import StaffVisitorVerification from "./pages/staff/VisitorVerification";
import StaffAssignedComplaints from "./pages/staff/AssignedComplaints";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, role } = useAuthStore();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === "admin" || role === "committee") return <Navigate to="/admin/dashboard" replace />;
    if (role === "staff" || role === "security" || role === "maintenance") return <Navigate to="/staff/visitors" replace />;
    return <Navigate to="/resident/dashboard" replace />;
  }

  return children;
};

function App() {
  const { role, token } = useAuthStore();

  const getDefaultRedirect = () => {
    if (!token) return "/login";
    if (role === "admin" || role === "committee") return "/admin/dashboard";
    if (role === "staff" || role === "security" || role === "maintenance") return "/staff/visitors";
    return "/resident/dashboard";
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to={getDefaultRedirect()} replace />} />

      {/* Admin & Committee Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={["admin", "committee"]}>
            <Routes>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="residents" element={<AdminResidents />} />
              <Route path="apartments" element={<AdminApartments />} />
              <Route path="complaints" element={<AdminComplaints />} />
              <Route path="maintenance" element={<AdminComplaints />} />
              <Route path="visitors" element={<AdminVisitors />} />
              <Route path="facilities" element={<AdminFacilities />} />
              <Route path="billing" element={<AdminBilling />} />
              <Route path="notices" element={<AdminNotices />} />
              <Route path="polls" element={<AdminPolls />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ProtectedRoute>
        }
      />

      {/* Resident Routes */}
      <Route
        path="/resident/*"
        element={
          <ProtectedRoute allowedRoles={["resident"]}>
            <Routes>
              <Route path="dashboard" element={<ResidentDashboard />} />
              <Route path="complaints" element={<ResidentComplaints />} />
              <Route path="facilities" element={<ResidentFacilities />} />
              <Route path="visitors" element={<ResidentVisitors />} />
              <Route path="billing" element={<ResidentBilling />} />
              <Route path="notices" element={<ResidentNotices />} />
              <Route path="polls" element={<ResidentPolls />} />
              <Route path="profile" element={<ResidentProfile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ProtectedRoute>
        }
      />

      {/* Staff Routes (Security & Maintenance) */}
      <Route
        path="/staff/*"
        element={
          <ProtectedRoute allowedRoles={["staff", "security", "maintenance"]}>
            <Routes>
              <Route path="visitors" element={<StaffVisitorVerification />} />
              <Route path="complaints" element={<StaffAssignedComplaints />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ProtectedRoute>
        }
      />

      <Route path="/500" element={<ServerError />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
