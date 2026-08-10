import { create } from "zustand";
import { persist } from "zustand/middleware";
import visitorApi from "../api/visitorApi";

const useVisitorStore = create(
  persist(
    (set, get) => ({
      visitors: [],
      requests: [],
      logs: [],
      loading: false,

      // Pre-register visitor via backend API
      preRegisterVisitor: async (visitorData) => {
        try {
          const payload = {
            visitor_name: visitorData.name || visitorData.visitor_name,
            visitor_phone: visitorData.phone || visitorData.visitor_phone || "+919876543210",
            visitor_type: visitorData.type || visitorData.visitor_type || "Guest",
            expected_date: visitorData.expectedDate || visitorData.expected_date || new Date().toISOString().split("T")[0],
            expected_time: visitorData.visitTime || visitorData.expectedTime || visitorData.expected_time || "10:00:00",
          };
          const res = await visitorApi.preRegisterVisitor(payload);
          if (res && res.success && res.data) {
            get().fetchVisitorRequests();
            return { success: true, data: res.data, otp: res.data.otp };
          }
          return { success: false, message: res?.message || "Failed to pre-register visitor." };
        } catch (err) {
          return { success: false, message: err.message || "Failed to pre-register visitor." };
        }
      },

      // Fetch visitor requests for current resident
      fetchVisitorRequests: async () => {
        let role = "";
        try {
          const stored = JSON.parse(localStorage.getItem("auth-storage") || "{}");
          role = stored?.state?.role || "";
        } catch { /* ignore */ }

        if (role !== "resident") {
          set({ loading: false });
          return { success: true, data: get().visitors };
        }

        set({ loading: true });
        try {
          const res = await visitorApi.getVisitorRequests();
          if (res && res.success && Array.isArray(res.data)) {
            const mapped = res.data.map((r) => ({
              id: r.request_id,
              name: r.visitor_name,
              phone: r.visitor_phone,
              purpose: r.visitor_type,
              date: r.expected_date,
              visitTime: r.expected_time,
              status: r.status === "pre_registered" ? "Expected" : r.status === "arrived" ? "Checked In" : r.status === "departed" ? "Completed" : r.status,
              otp: r.otp,
              createdAt: r.created_at || r.expected_date,
            }));
            set({ requests: res.data, visitors: mapped, loading: false });
            return { success: true, data: mapped };
          }
        } catch (err) {
          console.warn("Backend visitor requests fetch failed:", err.message);
        }
        set({ loading: false });
        return { success: false, data: get().visitors };
      },

      addVisitor: async (visitorData) => {
        return get().preRegisterVisitor(visitorData);
      },

      // Verify OTP at gate (Security)
      verifyOtp: async (requestId, otp) => {
        try {
          const res = await visitorApi.verifyVisitorOtp(requestId, otp);
          if (res && res.success && res.data) {
            get().fetchVisitorLogs();
            return { success: true, data: res.data };
          }
          return { success: false, message: res?.message || "Invalid OTP" };
        } catch (err) {
          return { success: false, message: err.message || "Invalid OTP" };
        }
      },

      // Log exit at gate (Security)
      logExit: async (logId) => {
        try {
          const res = await visitorApi.logVisitorExit(logId);
          if (res && res.success && res.data) {
            get().fetchVisitorLogs();
            return { success: true, data: res.data };
          }
          return { success: false, message: res?.message || "Exit log failed" };
        } catch (err) {
          return { success: false, message: err.message || "Exit log failed" };
        }
      },

      // Fetch visitor logs for admin
      fetchVisitorLogs: async () => {
        try {
          const res = await visitorApi.getVisitorLogs();
          if (res && res.success && Array.isArray(res.data)) {
            set({ logs: res.data });
            return { success: true, data: res.data };
          }
        } catch (err) {
          console.warn("Backend visitor logs fetch failed:", err.message);
        }
        return { success: false, data: get().logs };
      },

      resetVisitors: () => set({ visitors: [], requests: [], logs: [] }),
    }),
    {
      name: "visitor-storage",
    }
  )
);

export default useVisitorStore;