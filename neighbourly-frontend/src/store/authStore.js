import { create } from "zustand";
import { persist } from "zustand/middleware";
import useResidentStore from "./residentStore";

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      role: null, // 'admin' | 'resident'
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
            user: { name: "William Alexander", email },
            role: "resident",
            isAuthenticated: true,
          });
          return { success: true, role: "resident" };
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
