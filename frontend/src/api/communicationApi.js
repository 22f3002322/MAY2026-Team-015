import { apiRequest } from "./client";

// ── Module 7: Announcements (Admin/Committee manage, all authenticated read)
export const communicationApi = {
  // Announcements
  getAnnouncements: async (includeInactive = false) => {
    const qs = includeInactive ? "?include_inactive=true" : "";
    return apiRequest(`/api/v1/announcements${qs}`, { method: "GET" });
  },

  getAnnouncement: async (id) => {
    return apiRequest(`/api/v1/announcements/${id}`, { method: "GET" });
  },

  createAnnouncement: async (payload) => {
    return apiRequest("/api/v1/announcements", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateAnnouncement: async (id, payload) => {
    return apiRequest(`/api/v1/announcements/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  deleteAnnouncement: async (id) => {
    return apiRequest(`/api/v1/announcements/${id}`, { method: "DELETE" });
  },

  // Notifications (personal inbox — no create endpoint, backend fires them internally)
  getNotifications: async (unreadOnly = false) => {
    const qs = unreadOnly ? "?unread_only=true" : "";
    return apiRequest(`/api/v1/notifications${qs}`, { method: "GET" });
  },

  markNotificationRead: async (notificationId) => {
    return apiRequest(`/api/v1/notifications/${notificationId}/read`, { method: "POST" });
  },

  markAllRead: async () => {
    return apiRequest("/api/v1/notifications/read-all", { method: "POST" });
  },
};

export default communicationApi;
