import { create } from "zustand";
import { persist } from "zustand/middleware";
import communicationApi from "../api/communicationApi";

const mapBackendToNotice = (ann) => {
  if (!ann) return null;
  return {
    id: ann.announcement_id,
    noticeId: `NOT-${ann.announcement_id}`,
    title: ann.title,
    description: ann.description || "",
    priority: ann.priority ? ann.priority.charAt(0).toUpperCase() + ann.priority.slice(1) : "Normal",
    status: ann.is_active ? "Published" : "Draft",
    category: "General",
    publishDate: ann.published_at ? ann.published_at.split("T")[0] : new Date().toISOString().split("T")[0],
    expiryDate: ann.expiry_date || "",
    createdAt: ann.published_at || new Date().toISOString(),
    updatedAt: null,
  };
};

const useNoticeStore = create(
  persist(
    (set, get) => ({
      notices: [],          // Mapped announcements for backward compatibility
      announcements: [],    // Raw backend announcements
      notifications: [],    // personal inbox from /api/v1/notifications
      unreadCount: 0,
      loading: false,

      // ── Announcements ─────────────────────────────────────────────────────
      fetchAnnouncements: async (includeInactive) => {
        // Only admin/committee can include inactive; default based on role
        let isAdmin = false;
        try {
          const stored = JSON.parse(localStorage.getItem("auth-storage") || "{}");
          const role = stored?.state?.role || "";
          isAdmin = role === "admin" || role === "committee";
        } catch { /* ignore */ }
        const shouldIncludeInactive = includeInactive !== undefined ? includeInactive : isAdmin;
        set({ loading: true });
        try {
          const res = await communicationApi.getAnnouncements(shouldIncludeInactive);
          if (res && res.success && Array.isArray(res.data)) {
            const mapped = res.data.map(mapBackendToNotice);
            set({ 
              announcements: res.data, 
              notices: mapped,
              loading: false 
            });
            return { success: true, data: res.data };
          }
        } catch (err) {
          console.warn("Announcements fetch failed:", err.message);
        }
        set({ loading: false });
        return { success: false, data: get().notices };
      },

      addNotice: async (notice) => {
        try {
          const payload = {
            title: notice.title,
            description: notice.description || "",
            priority: (notice.priority || "normal").toLowerCase(),
            expiry_date: notice.expiryDate || null,
          };
          const res = await communicationApi.createAnnouncement(payload);
          if (res && res.success) {
            await get().fetchAnnouncements(true);
            return { success: true, data: res.data, message: res.message };
          }
          return { success: false, message: res?.message || "Failed to create announcement." };
        } catch (err) {
          return { success: false, message: err.message || "Failed to create announcement." };
        }
      },

      updateNotice: async (updatedNotice) => {
        try {
          const id = updatedNotice.id;
          const payload = {
            title: updatedNotice.title,
            description: updatedNotice.description || "",
            priority: (updatedNotice.priority || "normal").toLowerCase(),
            expiry_date: updatedNotice.expiryDate || null,
            is_active: updatedNotice.status === "Published",
          };
          const res = await communicationApi.updateAnnouncement(id, payload);
          if (res && res.success) {
            await get().fetchAnnouncements(true);
            return { success: true, data: res.data, message: res.message };
          }
          return { success: false, message: res?.message || "Update failed." };
        } catch (err) {
          return { success: false, message: err.message || "Failed to update announcement." };
        }
      },

      deleteNotice: async (id) => {
        try {
          const res = await communicationApi.deleteAnnouncement(id);
          if (res && res.success) {
            await get().fetchAnnouncements(true);
            return { success: true, message: res.message };
          }
          return { success: false, message: res?.message || "Delete failed." };
        } catch (err) {
          return { success: false, message: err.message || "Failed to delete announcement." };
        }
      },

      // ── Notifications (personal inbox) ────────────────────────────────────
      fetchNotifications: async (unreadOnly = false) => {
        try {
          const res = await communicationApi.getNotifications(unreadOnly);
          if (res && res.success && Array.isArray(res.data)) {
            const unread = res.data.filter((n) => !n.is_read).length;
            set({ notifications: res.data, unreadCount: unread });
            return { success: true, data: res.data };
          }
        } catch (err) {
          console.warn("Notifications fetch failed:", err.message);
        }
        return { success: false, data: get().notifications };
      },

      markRead: async (notificationId) => {
        set((state) => {
          const updated = state.notifications.map((n) =>
            n.notification_id === notificationId ? { ...n, is_read: true } : n
          );
          const unread = updated.filter((n) => !n.is_read).length;
          return { notifications: updated, unreadCount: unread };
        });
        try {
          await communicationApi.markNotificationRead(notificationId);
        } catch (err) {
          console.warn("Mark read failed:", err.message);
        }
      },

      markAllRead: async () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
          unreadCount: 0,
        }));
        try {
          await communicationApi.markAllRead();
        } catch (err) {
          console.warn("Mark all read failed:", err.message);
        }
      },

      resetNotices: () => set({ notices: [], announcements: [], notifications: [], unreadCount: 0 }),
      reset: () => set({ notices: [], announcements: [], notifications: [], unreadCount: 0 }),
    }),
    { name: "notice-storage" }
  )
);

export default useNoticeStore;