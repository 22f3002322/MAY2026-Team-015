import { create } from "zustand";
import { persist } from "zustand/middleware";
import useResidentStore from "./residentStore";
import useStaffStore from "./staffStore";

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      role: null, // 'admin' | 'resident' | 'staff'
      isAuthenticated: false,

      login: (email, password) => {
        // Hardcoded admin login
        if (email === "admin@example.com" && password === "admin123") {
          set({
            user: { name: "Admin User", email },
            role: "admin",
            isAuthenticated: true,
          });
          return { success: true, role: "admin" };
        }

        // Hardcoded demo resident login (fallback for local storage issues)
        if (email === "william@example.com" && password === "password123") {
          set({
            user: { name: "William Alexander", email, flat: "A-203", block: "A", phone: "+91 9876543210", occupancy: "Owner" },
            role: "resident",
            isAuthenticated: true,
          });
          return { success: true, role: "resident" };
        }

        // Hardcoded Staff logins fallback
        const staffAccounts = [
          { email: "security@example.com", password: "staff123", name: "Rajesh Kumar", staffRole: "security" },
          { email: "maintenance@example.com", password: "staff123", name: "Suresh Patel", staffRole: "maintenance" },
          { email: "housekeeping@example.com", password: "staff123", name: "Geeta Devi", staffRole: "housekeeping" },
        ];
        const staffMatch = staffAccounts.find((s) => s.email === email && s.password === password);
        if (staffMatch) {
          set({
            user: { name: staffMatch.name, email: staffMatch.email, staffRole: staffMatch.staffRole },
            role: "staff",
            isAuthenticated: true,
          });
          return { success: true, role: "staff" };
        }

        // Check staff store
        const staffStore = useStaffStore.getState();
        const employee = staffStore.staff.find(
          (s) => s.email === email && s.password === password
        );
        if (employee) {
          const staffRole = (employee.department || "Security").toLowerCase();
          set({
            user: { ...employee, staffRole },
            role: "staff",
            isAuthenticated: true,
          });
          return { success: true, role: "staff" };
        }

        // Check resident store
        const residentStore = useResidentStore.getState();
        const resident = residentStore.residents.find(
          (r) => r.email === email && r.password === password
        );

        if (resident) {
          set({
            user: resident,
            role: "resident",
            isAuthenticated: true,
          });
          return { success: true, role: "resident" };
        }

        return { success: false, message: "Invalid email or password" };
      },

      logout: () => {
        set({
          user: null,
          role: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "auth-storage",
    }
  )
);

export default useAuthStore;
