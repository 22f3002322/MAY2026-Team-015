import { apiRequest } from "./client";

// ── Module 4: Maintenance Staff Task Workflow
export const maintenanceApi = {
  // GET /api/v1/maintenance/tasks — caller's own tasks (verified maintenance staff)
  getMyTasks: async () => {
    return apiRequest("/api/v1/maintenance/tasks", { method: "GET" });
  },

  // GET /api/v1/maintenance-staff — Admin/Committee directory
  getStaffDirectory: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.is_available != null) query.append("is_available", params.is_available);
    if (params.specialization) query.append("specialization", params.specialization);
    const qs = query.toString() ? `?${query.toString()}` : "";
    return apiRequest(`/api/v1/maintenance-staff${qs}`, { method: "GET" });
  },

  // GET /api/v1/maintenance/tasks/{task_id}
  getTask: async (taskId) => {
    return apiRequest(`/api/v1/maintenance/tasks/${taskId}`, { method: "GET" });
  },

  // POST /api/v1/maintenance/tasks/{task_id}/accept — assigned → accepted
  acceptTask: async (taskId) => {
    return apiRequest(`/api/v1/maintenance/tasks/${taskId}/accept`, { method: "POST" });
  },

  // POST /api/v1/maintenance/tasks/{task_id}/decline — assigned → declined; complaint reopens
  declineTask: async (taskId) => {
    return apiRequest(`/api/v1/maintenance/tasks/${taskId}/decline`, { method: "POST" });
  },

  // POST /api/v1/maintenance/tasks/{task_id}/schedule  — { scheduled_at: ISO string }
  scheduleTask: async (taskId, scheduledAt) => {
    return apiRequest(`/api/v1/maintenance/tasks/${taskId}/schedule`, {
      method: "POST",
      body: JSON.stringify({ scheduled_at: scheduledAt }),
    });
  },

  // POST /api/v1/maintenance/tasks/{task_id}/start
  startTask: async (taskId) => {
    return apiRequest(`/api/v1/maintenance/tasks/${taskId}/start`, { method: "POST" });
  },

  // POST /api/v1/maintenance/tasks/{task_id}/complete
  completeTask: async (taskId) => {
    return apiRequest(`/api/v1/maintenance/tasks/${taskId}/complete`, { method: "POST" });
  },
};

export default maintenanceApi;