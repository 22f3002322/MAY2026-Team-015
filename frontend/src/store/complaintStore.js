import { create } from "zustand";
import { persist } from "zustand/middleware";
import complaintApi from "../api/complaintApi";

const useComplaintStore = create(
  persist(
    (set, get) => ({
      complaints: [],
      categories: [],       // for complaint filing (public endpoint)
      adminCategories: [],  // for admin/committee management
      loading: false,

      // ── Categories ─────────────────────────────────────────────────────
      // Public — any logged-in user can read; used to populate category dropdown
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

      // Admin/Committee categories management
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

      // ── Complaints ─────────────────────────────────────────────────────
      fetchComplaints: async () => {
        set({ loading: true });
        try {
          const res = await complaintApi.getComplaints();
          if (res && res.success && Array.isArray(res.data)) {
            set({ complaints: res.data, loading: false });
            return { success: true, data: res.data };
          }
        } catch (err) {
          console.warn("Complaints fetch failed:", err.message);
        }
        set({ loading: false });
        return { success: false, data: get().complaints };
      },

      // Create (verified Resident) — category_id required
      addComplaint: async (complaint) => {
        try {
          const res = await complaintApi.createComplaint({
            category_id: complaint.category_id || 1,
            title: complaint.title || complaint.subject || "Issue Report",
            description: complaint.description || complaint.details || "",
            priority: complaint.priority
              ? complaint.priority.toLowerCase()
              : "medium",
          });
          if (res && res.success) {
            const complaintId = res.data?.complaint_id || res.data?.id;
            if (complaintId && complaint.imageFile) {
              try {
                await complaintApi.uploadComplaintImage(complaintId, complaint.imageFile);
              } catch (imgErr) {
                console.warn("Complaint image upload failed:", imgErr.message);
              }
            }
            get().fetchComplaints();
            return { success: true, data: res.data, message: res.message };
          }
          return { success: false, message: res?.message || "Failed to file complaint." };
        } catch (err) {
          return { success: false, message: err.message || "Failed to file complaint." };
        }
      },

      // Update (Resident: description/priority only; Admin/Committee: any field)
      updateComplaint: async (id, updatedData) => {
        try {
          const res = await complaintApi.updateComplaint(id, updatedData);
          if (res && res.success) {
            set((state) => ({
              complaints: state.complaints.map((c) =>
                (c.complaint_id || c.id) === id ? { ...c, ...res.data } : c
              ),
            }));
            return { success: true, data: res.data, message: res.message };
          }
          return { success: false, message: res?.message || "Update failed." };
        } catch (err) {
          return { success: false, message: err.message || "Update failed." };
        }
      },

      // Admin/Committee — assign to maintenance staff
      // backend creates a MaintenanceTask row automatically
      assignComplaint: async (id, staffId) => {
        try {
          const res = await complaintApi.assignComplaint(id, staffId);
          if (res && res.success) {
            // Update local status immediately
            set((state) => ({
              complaints: state.complaints.map((c) =>
                (c.complaint_id || c.id) === id
                  ? { ...c, status: "assigned" }
                  : c
              ),
            }));
            return { success: true, data: res.data, message: res.message };
          }
          return { success: false, message: res?.message || "Assignment failed." };
        } catch (err) {
          return { success: false, message: err.message || "Assignment failed." };
        }
      },

      // Add feedback comment (optional rating, only accepted after resolved)
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

      // Selectors
      getComplaintById: (id) =>
        get().complaints.find((c) => c.complaint_id === id || c.id === id),

      getComplaintsByResident: (residentId) =>
        get().complaints.filter(
          (c) => c.resident_id === residentId || c.resident === residentId
        ),

      deleteComplaint: (id) =>
        set((state) => ({
          complaints: state.complaints.filter(
            (c) => c.complaint_id !== id && c.id !== id
          ),
        })),

      resetComplaints: () => set({ complaints: [], categories: [], adminCategories: [] }),
    }),
    { name: "complaint-storage" }
  )
);

export default useComplaintStore;