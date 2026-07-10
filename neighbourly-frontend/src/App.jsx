import { Routes, Route } from "react-router-dom";

import Dashboard from "./pages/admin/Dashboard";
import Residents from "./pages/admin/Residents";
import Apartments from "./pages/admin/Apartments";
import Complaints from "./pages/admin/Complaints";
import Visitors from "./pages/admin/Visitors";
import FacilityBookings from "./pages/admin/FacilityBookings";
import Billing from "./pages/admin/Billing";
import Notices from "./pages/admin/Notices";

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
    </Routes>
  );
}

export default App;