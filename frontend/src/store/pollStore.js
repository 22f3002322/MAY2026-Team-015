import { create } from "zustand";
import { persist } from "zustand/middleware";
import pollApi from "../api/pollApi";

const usePollStore = create(
  persist(
    (set, get) => ({
      polls: [],
      pollResults: {},  // keyed by poll_id
      loading: false,

      // ── Fetch all polls ───────────────────────────────────────────────────
      fetchPolls: async () => {
        set({ loading: true });
        try {
          const res = await pollApi.getPolls();
          if (res && res.success && Array.isArray(res.data)) {
            set({ polls: res.data, loading: false });
            return { success: true, data: res.data };
          }
        } catch (err) {
          console.warn("Polls fetch failed:", err.message);
        }
        set({ loading: false });
        return { success: false, data: get().polls };
      },

      // ── Create poll (Admin/Committee) ─────────────────────────────────────
      createPoll: async (payload) => {
        try {
          const res = await pollApi.createPoll(payload);
          if (res && res.success) {
            await get().fetchPolls();
            return { success: true, data: res.data, message: res.message };
          }
          return { success: false, message: res?.message || "Failed to create poll." };
        } catch (err) {
          return { success: false, message: err.message || "Failed to create poll." };
        }
      },

      // ── Update poll (Admin/Committee) ─────────────────────────────────────
      updatePoll: async (pollId, payload) => {
        try {
          const res = await pollApi.updatePoll(pollId, payload);
          if (res && res.success) {
            await get().fetchPolls();
            return { success: true, data: res.data, message: res.message };
          }
          return { success: false, message: res?.message || "Update failed." };
        } catch (err) {
          return { success: false, message: err.message || "Failed to update poll." };
        }
      },

      // ── Vote (verified Resident only) ─────────────────────────────────────
      votePoll: async (pollId, optionId) => {
        try {
          const res = await pollApi.vote(pollId, optionId);
          if (res && res.success) {
            // Mark locally as voted so UI updates immediately
            set((state) => ({
              polls: state.polls.map((p) =>
                (p.poll_id || p.id) === pollId
                  ? { ...p, user_voted: true, userVoted: true }
                  : p
              ),
            }));
            await get().fetchResults(pollId);
            return { success: true, data: res.data, message: res.message };
          }
          return { success: false, message: res?.message || "Vote failed." };
        } catch (err) {
          return { success: false, message: err.message || "Failed to cast vote." };
        }
      },

      // ── Fetch live results for a specific poll ────────────────────────────
      fetchResults: async (pollId) => {
        try {
          const res = await pollApi.getResults(pollId);
          if (res && res.success && res.data) {
            set((state) => ({
              pollResults: { ...state.pollResults, [pollId]: res.data },
            }));
            return { success: true, data: res.data };
          }
        } catch (err) {
          console.warn("Poll results fetch failed:", err.message);
        }
        return { success: false };
      },

      // Selectors
      getPollById: (id) =>
        get().polls.find((p) => p.poll_id === id || p.id === id),

      getPollStats: () => {
        const polls = get().polls;
        return {
          totalPolls: polls.length,
          activePolls: polls.filter((p) => p.is_active).length,
          closedPolls: polls.filter((p) => !p.is_active).length,
          totalVotes: polls.reduce((sum, p) => sum + (p.total_votes || 0), 0),
        };
      },

      reset: () => set({ polls: [], pollResults: {} }),
    }),
    { name: "poll-storage" }
  )
);

export default usePollStore;