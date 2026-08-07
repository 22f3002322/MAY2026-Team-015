import { apiRequest } from "./client";

export const visitorApi = {
  // Pre-register visitor (Resident)
  preRegisterVisitor: async (payload) => {
    // payload: { visitor_name, visitor_phone, visitor_type, expected_date, expected_time }
    return apiRequest("/api/v1/visitors/pre-register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // List my visitor requests (Resident)
  getVisitorRequests: async () => {
    return apiRequest("/api/v1/visitors/requests", {
      method: "GET",
    });
  },

  // Verify OTP for visitor entry (Security Guard / Staff)
  verifyVisitorOtp: async (requestId, otp) => {
    return apiRequest(`/api/v1/visitors/${requestId}/verify-otp`, {
      method: "POST",
      body: JSON.stringify({ otp }),
    });
  },

  // Log visitor exit (Security Guard / Staff)
  logVisitorExit: async (logId) => {
    return apiRequest(`/api/v1/visitors/logs/${logId}/exit`, {
      method: "POST",
    });
  },

  // List visitor logs (Admin)
  getVisitorLogs: async () => {
    return apiRequest("/api/v1/visitors/logs", {
      method: "GET",
    });
  },
};

export default visitorApi;
