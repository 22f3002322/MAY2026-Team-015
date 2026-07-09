import { Routes, Route } from "react-router-dom";

import Dashboard from "./pages/admin/Dashboard";
import Residents from "./pages/admin/Residents";
import Apartments from "./pages/admin/Apartments";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/residents" element={<Residents />} />
      <Route path="/apartments" element={<Apartments/>} />
    </Routes>
  );
}

export default App;