import { apiRequest } from "./client";

export const visitorApi = {
  preRegisterVisitor: async (payload) => {
    return apiRequest("/api/v1/visitors/pre-register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getVisitorRequests: async () => {
    return apiRequest("/api/v1/visitors/requests", {
      method: "GET",
    });
  },

  getAllVisitorRequests: async () => {
    return apiRequest("/api/v1/visitors/requests/all", {
      method: "GET",
    });
  },

  denyVisitorRequest: async (requestId) => {
    return apiRequest(`/api/v1/visitors/${requestId}/deny`, {
      method: "POST",
    });
  },

  verifyVisitorOtp: async (requestId, otp) => {
    return apiRequest(`/api/v1/visitors/${requestId}/verify-otp`, {
      method: "POST",
      body: JSON.stringify({ otp }),
    });
  },

  logVisitorExit: async (logId) => {
    return apiRequest(`/api/v1/visitors/logs/${logId}/exit`, {
      method: "POST",
    });
  },

  getVisitorLogs: async () => {
    return apiRequest("/api/v1/visitors/logs", {
      method: "GET",
    });
  },
};

export default visitorApi;
