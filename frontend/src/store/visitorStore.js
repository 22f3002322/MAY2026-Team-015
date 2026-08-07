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
            expected_time: visitorData.expectedTime || visitorData.expected_time || "10:00:00",
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
        set({ loading: true });
        try {
          const res = await visitorApi.getVisitorRequests();
          if (res && res.success && Array.isArray(res.data)) {
            set({ requests: res.data, loading: false });
            return { success: true, data: res.data };
          }
        } catch (err) {
          console.warn("Backend visitor requests fetch failed:", err.message);
        }
        set({ loading: false });
        return { success: false, data: get().requests };
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