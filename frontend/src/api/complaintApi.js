import { apiRequest } from "./client";

export const complaintApi = {
  // ── Categories ─────────────────────────────────────────────────────────
  // Admin/Committee: manage categories
  getAdminCategories: async () => {
    return apiRequest("/api/v1/admin/complaint-categories", { method: "GET" });
  },

  createCategory: async (payload) => {
    return apiRequest("/api/v1/admin/complaint-categories", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Any authenticated user: read-only category list for filing complaints
  getCategories: async () => {
    return apiRequest("/api/v1/complaint-categories", { method: "GET" });
  },

  // ── Complaints ─────────────────────────────────────────────────────────
  // List complaints — scoped by backend based on caller's role:
  //   Resident → own only, Maintenance → assigned only, Admin/Committee → all
  getComplaints: async () => {
    return apiRequest("/api/v1/complaints", { method: "GET" });
  },

  // Create complaint (verified Resident)
  createComplaint: async (payload) => {
    return apiRequest("/api/v1/complaints", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Get single complaint (ownership-checked by backend)
  getComplaint: async (id) => {
    return apiRequest(`/api/v1/complaints/${id}`, { method: "GET" });
  },

  // Update complaint (Resident may edit description/priority only, NOT status)
  updateComplaint: async (id, payload) => {
    return apiRequest(`/api/v1/complaints/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  // Assign complaint to maintenance staff (Admin/Committee only)
  assignComplaint: async (complaintId, staffId) => {
    return apiRequest(`/api/v1/complaints/${complaintId}/assign`, {
      method: "POST",
      body: JSON.stringify({ staff_id: staffId }),
    });
  },

  // Add comment/feedback — optional rating (1–5), only accepted once resolved
  addComment: async (complaintId, feedback, rating = null) => {
    const body = { feedback };
    if (rating !== null) body.rating = rating;
    return apiRequest(`/api/v1/complaints/${complaintId}/comments`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  // Upload complaint attachment image (POST /api/v1/complaints/{id}/images)
  uploadComplaintImage: async (complaintId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiRequest(`/api/v1/complaints/${complaintId}/images`, {
      method: "POST",
      body: formData,
    });
  },
};

export default complaintApi;
