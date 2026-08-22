import { create } from "zustand";
import { persist } from "zustand/middleware";
import visitorApi from "../api/visitorApi";

const STATUS_LABEL = {
  expected: "Expected",
  pre_registered: "Expected",
  arrived: "Arrived",
  denied: "Denied",
  departed: "Departed",
};

const mapStatus = (raw) => {
  const value = String(raw || "expected").toLowerCase();
  return {
    statusValue: value === "pre_registered" ? "expected" : value,
    status: STATUS_LABEL[value] || value,
  };
};

const isPlainOtp = (otp) => {
  if (!otp) return false;
  const s = String(otp);
  return /^\d{4,8}$/.test(s);
};

const useVisitorStore = create(
  persist(
    (set, get) => ({
      visitors: [],
      requests: [],
      allRequests: [],
      logs: [],
      myLogs: [],
      loading: false,
      lastPlainOtp: null,

      preRegisterVisitor: async (visitorData) => {
        try {
          const timeRaw =
            visitorData.visitTime ||
            visitorData.expectedTime ||
            visitorData.expected_time ||
            "10:00";
          const expected_time =
            String(timeRaw).length === 5 ? `${timeRaw}:00` : timeRaw;

          const payload = {
            visitor_name: visitorData.name || visitorData.visitor_name,
            visitor_phone:
              visitorData.phone || visitorData.visitor_phone || "",
            visitor_type:
              visitorData.purpose ||
              visitorData.type ||
              visitorData.visitor_type ||
              "Guest",
            expected_date:
              visitorData.expectedDate ||
              visitorData.date ||
              visitorData.expected_date ||
              new Date().toISOString().split("T")[0],
            expected_time,
          };

          const res = await visitorApi.preRegisterVisitor(payload);
          if (res && res.success && res.data) {
            const plainOtp = res.data.otp;
            set({ lastPlainOtp: plainOtp || null });
            await get().fetchVisitorRequests();
            return {
              success: true,
              data: res.data,
              otp: plainOtp,
              message: res.message,
            };
          }
          return {
            success: false,
            message: res?.message || "Failed to pre-register visitor.",
          };
        } catch (err) {
          return {
            success: false,
            message: err.message || "Failed to pre-register visitor.",
          };
        }
      },

      fetchVisitorRequests: async () => {
        set({ loading: true });
        try {
          const res = await visitorApi.getVisitorRequests();
          if (res && res.success && Array.isArray(res.data)) {
            const mapped = res.data.map((r) => {
              const { status, statusValue } = mapStatus(r.status);
              return {
                id: r.request_id,
                name: r.visitor_name,
                phone: r.visitor_phone,
                purpose: r.visitor_type,
                date: r.expected_date,
                visitTime: r.expected_time,
                status,
                statusValue,
                otpSent: statusValue === "expected",
                // Never surface hashed OTP from list responses
                otp: null,
                createdAt: r.created_at || r.expected_date,
              };
            });
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

      denyVisitor: async (requestId) => {
        try {
          const res = await visitorApi.denyVisitorRequest(requestId);
          if (res && res.success) {
            await get().fetchVisitorRequests();
            return { success: true, data: res.data, message: res.message };
          }
          return {
            success: false,
            message: res?.message || "Failed to deny visitor request.",
          };
        } catch (err) {
          return {
            success: false,
            message: err.message || "Failed to deny visitor request.",
          };
        }
      },

      verifyOtp: async (requestId, otp) => {
        try {
          const res = await visitorApi.verifyVisitorOtp(requestId, otp);
          if (res && res.success && res.data) {
            // Security-only action -- GET /visitors/logs is Admin-only,
            // so refresh the guard's own scoped log view instead.
            get().fetchMyVisitorLogs();
            return { success: true, data: res.data };
          }
          return { success: false, message: res?.message || "Invalid OTP" };
        } catch (err) {
          return { success: false, message: err.message || "Invalid OTP" };
        }
      },

      logExit: async (logId) => {
        try {
          const res = await visitorApi.logVisitorExit(logId);
          if (res && res.success && res.data) {
            get().fetchMyVisitorLogs();
            return { success: true, data: res.data };
          }
          return { success: false, message: res?.message || "Exit log failed" };
        } catch (err) {
          return { success: false, message: err.message || "Exit log failed" };
        }
      },

      // Admin/Committee full audit trail (GET /visitors/logs, Admin-only).
      fetchVisitorLogs: async () => {
        set({ loading: true });
        try {
          const res = await visitorApi.getVisitorLogs();
          if (res && res.success && Array.isArray(res.data)) {
            set({ logs: res.data, loading: false });
            return { success: true, data: res.data };
          }
        } catch (err) {
          console.warn("Backend visitor logs fetch failed:", err.message);
        }
        set({ loading: false });
        return { success: false, data: get().logs };
      },

      // Security's own scoped check-in history (GET /visitors/logs/mine).
      fetchMyVisitorLogs: async () => {
        set({ loading: true });
        try {
          const res = await visitorApi.getMyVisitorLogs();
          if (res && res.success && Array.isArray(res.data)) {
            set({ myLogs: res.data, loading: false });
            return { success: true, data: res.data };
          }
        } catch (err) {
          console.warn("Backend my-visitor-logs fetch failed:", err.message);
        }
        set({ loading: false });
        return { success: false, data: get().myLogs };
      },

      fetchAllVisitorRequests: async () => {
        try {
          const res = await visitorApi.getAllVisitorRequests();
          if (res && res.success && Array.isArray(res.data)) {
            set({ allRequests: res.data });
            return { success: true, data: res.data };
          }
        } catch (err) {
          console.warn("All visitor requests fetch failed:", err.message);
        }
        return { success: false, data: get().allRequests };
      },

      clearLastPlainOtp: () => set({ lastPlainOtp: null }),

      resetVisitors: () =>
        set({
          visitors: [],
          requests: [],
          allRequests: [],
          logs: [],
          myLogs: [],
          lastPlainOtp: null,
        }),
    }),
    {
      name: "visitor-storage",
    }
  )
);

export { isPlainOtp };
export default useVisitorStore;