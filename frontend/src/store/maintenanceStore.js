import { create } from "zustand";
import { persist } from "zustand/middleware";
import maintenanceApi from "../api/maintenanceApi";

const useMaintenanceStore = create(
  persist(
    (set, get) => ({
      tasks: [],
      loading: false,

      // ── Fetch maintenance staff's own tasks ───────────────────────────────
      fetchMyTasks: async () => {
        set({ loading: true });
        try {
          const res = await maintenanceApi.getMyTasks();
          if (res && res.success && Array.isArray(res.data)) {
            set({ tasks: res.data, loading: false });
            return { success: true, data: res.data };
          }
        } catch (err) {
          console.warn("Tasks fetch failed:", err.message);
        }
        set({ loading: false });
        return { success: false, data: get().tasks };
      },

      // ── Schedule: set a target date/time ─────────────────────────────────
      scheduleTask: async (taskId, scheduledAt) => {
        try {
          const res = await maintenanceApi.scheduleTask(taskId, scheduledAt);
          if (res && res.success) {
            set((state) => ({
              tasks: state.tasks.map((t) =>
                t.task_id === taskId ? { ...t, ...res.data } : t
              ),
            }));
            return { success: true, data: res.data, message: res.message };
          }
          return { success: false, message: res?.message || "Schedule failed." };
        } catch (err) {
          return { success: false, message: err.message || "Failed to schedule task." };
        }
      },

      // ── Start: accepted → in_progress ────────────────────────────────────
      startTask: async (taskId) => {
        try {
          const res = await maintenanceApi.startTask(taskId);
          if (res && res.success) {
            set((state) => ({
              tasks: state.tasks.map((t) =>
                t.task_id === taskId ? { ...t, ...res.data } : t
              ),
            }));
            return { success: true, data: res.data, message: res.message };
          }
          return { success: false, message: res?.message || "Start failed." };
        } catch (err) {
          return { success: false, message: err.message || "Failed to start task." };
        }
      },

      // ── Complete: in_progress → completed  (also resolves parent complaint)
      completeTask: async (taskId) => {
        try {
          const res = await maintenanceApi.completeTask(taskId);
          if (res && res.success) {
            set((state) => ({
              tasks: state.tasks.map((t) =>
                t.task_id === taskId ? { ...t, ...res.data } : t
              ),
            }));
            return { success: true, data: res.data, message: res.message };
          }
          return { success: false, message: res?.message || "Complete failed." };
        } catch (err) {
          return { success: false, message: err.message || "Failed to complete task." };
        }
      },

      getTaskById: (id) => get().tasks.find((t) => t.task_id === id),

      reset: () => set({ tasks: [] }),
    }),
    { name: "maintenance-storage" }
  )
);

export default useMaintenanceStore;
