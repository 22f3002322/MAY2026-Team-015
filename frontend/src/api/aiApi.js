import { apiRequest } from "./client";

/** Normalize AI HTTP failures (503 unavailable / rate limit, 403, etc.). */
export function getAiErrorInfo(err) {
  const status = err?.status;
  const message = err?.message || "Something went wrong.";

  if (status === 503) {
    const isRate = /rate limit/i.test(message);
    return {
      status,
      kind: isRate ? "rate_limit" : "unavailable",
      message: isRate
        ? "Chat rate limit exceeded. Please wait a minute and try again."
        : "AI is temporarily unavailable.",
    };
  }

  if (status === 403) {
    return { status, kind: "forbidden", message };
  }

  return { status, kind: "error", message };
}

export const aiApi = {
  classifyComplaint: async (description, categoryHints) => {
    const body = { description };
    if (Array.isArray(categoryHints) && categoryHints.length) {
      body.category_hints = categoryHints;
    }
    return apiRequest("/api/v1/ai/complaints/classify", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  getStaffRecommendations: async (complaintId) => {
    return apiRequest(
      `/api/v1/ai/complaints/${complaintId}/staff-recommendations`,
      { method: "GET" }
    );
  },

  search: async (q, limit = 10) => {
    const params = new URLSearchParams({
      q,
      limit: String(limit),
    });
    return apiRequest(`/api/v1/ai/search?${params.toString()}`, {
      method: "GET",
    });
  },

  summarizeComplaints: async (payload = {}) => {
    return apiRequest("/api/v1/ai/reports/complaints/summary", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  chat: async (messages) => {
    return apiRequest("/api/v1/ai/chat", {
      method: "POST",
      body: JSON.stringify({ messages }),
    });
  },
};

export default aiApi;
