import { Routes, Route, Navigate } from "react-router-dom";

// Auth
import Login from "./pages/Login";
import RoleRoute from "./components/auth/RoleRoute";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminResidents from "./pages/admin/Residents";
import AdminApartments from "./pages/admin/Apartments";
import AdminComplaints from "./pages/admin/Complaints";
import AdminVisitors from "./pages/admin/Visitors";
import AdminFacilityBookings from "./pages/admin/FacilityBookings";
import AdminBilling from "./pages/admin/Billing";
import AdminNotices from "./pages/admin/Notices";
import AdminDocuments from "./pages/admin/Documents";
import AdminPolls from "./pages/admin/Polls";
import AdminSettings from "./pages/admin/Settings";
import AdminReports from "./pages/admin/Reports";
import AdminStaff from "./pages/admin/Staff";

// Resident Pages
import ResidentDashboard from "./pages/resident/Dashboard";
import ResidentBills from "./pages/resident/Bills";
import ResidentComplaints from "./pages/resident/Complaints";
import ResidentDocuments from "./pages/resident/Documents";
import ResidentEvents from "./pages/resident/Events";
import ResidentFacilities from "./pages/resident/Facilities";
import ResidentNotices from "./pages/resident/Notices";
import ResidentPolls from "./pages/resident/Polls";
import ResidentProfile from "./pages/resident/Profile";
import ResidentSettings from "./pages/resident/Settings";
import ResidentVisitors from "./pages/resident/Visitors";

import NotFound from "./pages/NotFound";
import useAuthStore from "./store/authStore";

const RootRedirect = () => {
  const { isAuthenticated, role } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={`/${role}/dashboard`} replace />;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      
      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<RoleRoute requiredRole="admin"><AdminDashboard /></RoleRoute>} />
      <Route path="/admin/residents" element={<RoleRoute requiredRole="admin"><AdminResidents /></RoleRoute>} />
      <Route path="/admin/apartments" element={<RoleRoute requiredRole="admin"><AdminApartments/></RoleRoute>} />
      <Route path="/admin/complaints" element={<RoleRoute requiredRole="admin"><AdminComplaints /></RoleRoute>} />
      <Route path="/admin/visitors" element={<RoleRoute requiredRole="admin"><AdminVisitors /></RoleRoute>} />
      <Route path="/admin/bookings" element={<RoleRoute requiredRole="admin"><AdminFacilityBookings /></RoleRoute>} />
      <Route path="/admin/billing" element={<RoleRoute requiredRole="admin"><AdminBilling /></RoleRoute>} />
      <Route path="/admin/notices" element={<RoleRoute requiredRole="admin"><AdminNotices /></RoleRoute>} />
      <Route path="/admin/documents" element={<RoleRoute requiredRole="admin"><AdminDocuments /></RoleRoute>} />
      <Route path="/admin/polls" element={<RoleRoute requiredRole="admin"><AdminPolls /></RoleRoute>} />
      <Route path="/admin/settings" element={<RoleRoute requiredRole="admin"><AdminSettings /></RoleRoute>} />
      <Route path="/admin/reports" element={<RoleRoute requiredRole="admin"><AdminReports /></RoleRoute>} />
      <Route path="/admin/staff" element={<RoleRoute requiredRole="admin"><AdminStaff /></RoleRoute>} />

      {/* Resident Routes */}
      <Route path="/resident/dashboard" element={<RoleRoute requiredRole="resident"><ResidentDashboard /></RoleRoute>} />
      <Route path="/resident/bills" element={<RoleRoute requiredRole="resident"><ResidentBills /></RoleRoute>} />
      <Route path="/resident/complaints" element={<RoleRoute requiredRole="resident"><ResidentComplaints /></RoleRoute>} />
      <Route path="/resident/documents" element={<RoleRoute requiredRole="resident"><ResidentDocuments /></RoleRoute>} />
      <Route path="/resident/events" element={<RoleRoute requiredRole="resident"><ResidentEvents /></RoleRoute>} />
      <Route path="/resident/facilities" element={<RoleRoute requiredRole="resident"><ResidentFacilities /></RoleRoute>} />
      <Route path="/resident/notices" element={<RoleRoute requiredRole="resident"><ResidentNotices /></RoleRoute>} />
      <Route path="/resident/polls" element={<RoleRoute requiredRole="resident"><ResidentPolls /></RoleRoute>} />
      <Route path="/resident/profile" element={<RoleRoute requiredRole="resident"><ResidentProfile /></RoleRoute>} />
      <Route path="/resident/settings" element={<RoleRoute requiredRole="resident"><ResidentSettings /></RoleRoute>} />
      <Route path="/resident/visitors" element={<RoleRoute requiredRole="resident"><ResidentVisitors /></RoleRoute>} />
      
      {/* Fallback for old un-prefixed routes - redirect to root so auth logic handles it */}
      <Route path="/dashboard" element={<Navigate to="/" replace />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;