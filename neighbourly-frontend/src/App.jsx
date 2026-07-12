import { Routes, Route } from "react-router-dom";

import Dashboard from "./pages/admin/Dashboard";
import Residents from "./pages/admin/Residents";
import Apartments from "./pages/admin/Apartments";
import Complaints from "./pages/admin/Complaints";
import Visitors from "./pages/admin/Visitors";
import FacilityBookings from "./pages/admin/FacilityBookings";
import Billing from "./pages/admin/Billing";
import Notices from "./pages/admin/Notices";
import Documents from "./pages/admin/Documents";
import Polls from "./pages/admin/Polls";
import Settings from "./pages/admin/Settings";
import Reports from "./pages/admin/Reports";
import Staff from "./pages/admin/Staff";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/residents" element={<Residents />} />
      <Route path="/apartments" element={<Apartments/>} />
      <Route path="/complaints" element={<Complaints />} />
      <Route path="/visitors" element={<Visitors />} />
      <Route path="/bookings" element={<FacilityBookings />} />
      <Route path="/billing" element={<Billing />} />
      <Route path="/notices" element={<Notices />} />
      <Route path="/documents" element={<Documents />} />
      <Route path="/polls" element={<Polls />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/staff" element={<Staff />} />
    </Routes>
  );
}

export default App;