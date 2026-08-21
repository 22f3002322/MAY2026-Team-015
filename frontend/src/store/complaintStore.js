import complaintApi from "../api/complaintApi";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { COMPLAINT_PRIORITY, COMPLAINT_STATUS, labelFor } from "../utils/adminMaps";

const mapComplaint = (c) => {
  if (!c) return null;
  const id = c.complaint_id || c.id;
  const assignments = Array.isArray(c.assignments) ? c.assignments : [];
  const latestAssignment = [...assignments].sort(
    (a, b) => new Date(b.assigned_at || 0) - new Date(a.assigned_at || 0)
  )[0];
  const assignedStaffId = latestAssignment?.assigned_to;

  return {
    ...c,
    id,
    complaint_id: id,
    ticket: `CMP-${id}`,
    title: (c.description || "").slice(0, 60) || c.title || "Complaint",
    description: c.description || "",
    category: c.category_name || c.category || "—",
    category_id: c.category_id,
    resident: c.resident_name || c.resident || `Resident #${c.resident_id}`,
    flat: c.flat_number || c.flat || "—",
    priority: labelFor(COMPLAINT_PRIORITY, c.priority) || c.priority,
    priorityValue: String(c.priority || "medium").toLowerCase(),
    status: labelFor(COMPLAINT_STATUS, c.status) || c.status,
    statusValue: String(c.status || "open").toLowerCase(),
    assignedTo: assignedStaffId != null ? `Staff #${assignedStaffId}` : undefined,
    createdAt: c.created_at
      ? new Date(c.created_at).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "",
  };
};

const useComplaintStore = create(
  persist(
    (set, get) => ({
      complaints: [],
      categories: [],
      adminCategories: [],
      loading: false,

      fetchCategories: async () => {
        try {
          const res = await complaintApi.getCategories();
          if (res && res.success && Array.isArray(res.data)) {
            set({ categories: res.data });
            return { success: true, data: res.data };
          }
        } catch (err) {
          console.warn("Categories fetch failed:", err.message);
        }
        return { success: false, data: get().categories };
      },

      fetchAdminCategories: async () => {
        try {
          const res = await complaintApi.getAdminCategories();
          if (res && res.success && Array.isArray(res.data)) {
            set({ adminCategories: res.data });
            return { success: true, data: res.data };
          }
        } catch (err) {
          console.warn("Admin categories fetch failed:", err.message);
        }
        return { success: false, data: get().adminCategories };
      },

      createCategory: async (payload) => {
        try {
          const res = await complaintApi.createCategory(payload);
          if (res && res.success) {
            get().fetchAdminCategories();
            return { success: true, data: res.data, message: res.message };
          }
          return { success: false, message: res?.message || "Failed to create category." };
        } catch (err) {
          return { success: false, message: err.message || "Failed to create category." };
        }
      },

      fetchComplaints: async () => {
        set({ loading: true });
        try {
          const res = await complaintApi.getComplaints();
          if (res && res.success && Array.isArray(res.data)) {
            set({ complaints: res.data.map(mapComplaint), loading: false });
            return { success: true, data: res.data };
          }
        } catch (err) {
          console.warn("Complaints fetch failed:", err.message);
        }
        set({ loading: false });
        return { success: false, data: get().complaints };
      },

      addComplaint: async (complaint) => {
        try {
          const res = await complaintApi.createComplaint({
            category_id: complaint.category_id || 1,
            description: complaint.description || complaint.details || complaint.title || "",
            priority: complaint.priority
              ? String(complaint.priority).toLowerCase()
              : "medium",
          });
          if (res && res.success) {
            const complaintId = res.data?.complaint_id || res.data?.id;
            let imageUploadFailed = false;
            if (complaintId && complaint.imageFile) {
              try {
                await complaintApi.uploadComplaintImage(complaintId, complaint.imageFile);
              } catch (imgErr) {
                console.warn("Complaint image upload failed:", imgErr.message);
                imageUploadFailed = true;
              }
            }
            await get().fetchComplaints();
            return {
              success: true,
              data: res.data,
              message: res.message,
              imageUploadFailed,
            };
          }
          return { success: false, message: res?.message || "Failed to file complaint." };
        } catch (err) {
          return { success: false, message: err.message || "Failed to file complaint." };
        }
      },

      updateComplaint: async (id, updatedData) => {
        try {
          const payload = {};
          if (updatedData.description != null) {
            payload.description = updatedData.description;
          }
          if (updatedData.priority != null) {
            payload.priority = String(updatedData.priority).toLowerCase();
          }
          if (updatedData.status != null) {
            payload.status = String(updatedData.status)
              .toLowerCase()
              .replace(/\s+/g, "_");
          }
          if (updatedData.category_id != null) {
            payload.category_id = updatedData.category_id;
          }
          const res = await complaintApi.updateComplaint(id, payload);
          if (res && res.success) {
            await get().fetchComplaints();
            return { success: true, data: res.data, message: res.message };
          }
          return { success: false, message: res?.message || "Update failed." };
        } catch (err) {
          return { success: false, message: err.message || "Update failed." };
        }
      },

      assignComplaint: async (id, staffId) => {
        try {
          const res = await complaintApi.assignComplaint(id, staffId);
          if (res && res.success) {
            await get().fetchComplaints();
            return { success: true, data: res.data, message: res.message };
          }
          return { success: false, message: res?.message || "Assignment failed." };
        } catch (err) {
          return { success: false, message: err.message || "Assignment failed." };
        }
      },

      addComment: async (complaintId, feedback, rating = null) => {
        try {
          const res = await complaintApi.addComment(complaintId, feedback, rating);
          if (res && res.success) {
            get().fetchComplaints();
            return { success: true, message: res.message };
          }
          return { success: false, message: res?.message || "Comment failed." };
        } catch (err) {
          return { success: false, message: err.message || "Failed to add comment." };
        }
      },

      getComplaintById: (id) =>
        get().complaints.find((c) => c.complaint_id === id || c.id === id),

      getComplaintsByResident: (residentId) =>
        get().complaints.filter(
          (c) => c.resident_id === residentId || c.resident === residentId
        ),

      deleteComplaint: () => ({ success: false, message: "Complaint delete is not supported." }),

      resetComplaints: () => set({ complaints: [], categories: [], adminCategories: [] }),
    }),
    { name: "complaint-storage" }
  )
);

export default useComplaintStore;
