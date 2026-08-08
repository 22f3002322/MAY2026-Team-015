import { apiRequest } from "./client";

// ── Module 9: Polls & Voting
export const pollApi = {
  getPolls: async () => {
    return apiRequest("/api/v1/polls", { method: "GET" });
  },

  getPoll: async (pollId) => {
    return apiRequest(`/api/v1/polls/${pollId}`, { method: "GET" });
  },

  createPoll: async (payload) => {
    // payload: { question, options: [{text}], start_date, end_date, anonymous?, allow_multiple_votes? }
    return apiRequest("/api/v1/polls", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updatePoll: async (pollId, payload) => {
    return apiRequest(`/api/v1/polls/${pollId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  vote: async (pollId, optionId) => {
    return apiRequest(`/api/v1/polls/${pollId}/vote`, {
      method: "POST",
      body: JSON.stringify({ option_id: optionId }),
    });
  },

  getResults: async (pollId) => {
    return apiRequest(`/api/v1/polls/${pollId}/results`, { method: "GET" });
  },
};

export default pollApi;
