import { create } from "zustand";
import aiApi, { getAiErrorInfo } from "../api/aiApi";
import { formatChatReply } from "../utils/formatChatReply";

const MAX_MESSAGES = 20;

const emptyState = {
  isOpen: false,
  tab: "ask",
  messages: [],
  sending: false,
  error: null,
  searchQuery: "",
  searchResults: [],
  searchReranked: false,
  searching: false,
  searchError: null,
};

const useAiStore = create((set, get) => ({
  ...emptyState,

  openPanel: (tab) =>
    set({
      isOpen: true,
      tab: tab || get().tab || "ask",
      error: null,
    }),
  closePanel: () => set({ isOpen: false }),
  togglePanel: () => set((s) => ({ isOpen: !s.isOpen })),
  setTab: (tab) => set({ tab, error: null, searchError: null }),

  reset: () =>
    set({
      isOpen: false,
      tab: "ask",
      messages: [],
      sending: false,
      error: null,
      searchQuery: "",
      searchResults: [],
      searchReranked: false,
      searching: false,
      searchError: null,
    }),

  clearConversation: () =>
    set({
      messages: [],
      sending: false,
      error: null,
      searchQuery: "",
      searchResults: [],
      searchReranked: false,
      searching: false,
      searchError: null,
    }),

  sendMessage: async (content) => {
    const trimmed = String(content || "").trim().slice(0, 4000);
    if (!trimmed || get().sending) {
      return { success: false };
    }

    const userMsg = { role: "user", content: trimmed };
    const history = [...get().messages, userMsg].slice(-MAX_MESSAGES);
    set({ messages: history, sending: true, error: null, isOpen: true, tab: "ask" });

    try {
      const payload = history
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role, content: m.content }))
        .slice(-MAX_MESSAGES);

      const res = await aiApi.chat(payload);
      if (res?.success && res.data) {
        const assistantMsg = {
          role: "assistant",
            content: formatChatReply(res.data.reply || ""),
          citations: Array.isArray(res.data.citations) ? res.data.citations : [],
          refused: Boolean(res.data.refused),
        };
        set({
          messages: [...get().messages, assistantMsg].slice(-MAX_MESSAGES),
          sending: false,
        });
        return { success: true };
      }

      set({
        sending: false,
        error: { kind: "error", message: res?.message || "Chat failed." },
      });
      return { success: false };
    } catch (err) {
      set({ sending: false, error: getAiErrorInfo(err) });
      return { success: false };
    }
  },

  search: async (q) => {
    const query = String(q || "").trim();
    if (query.length < 2) {
      set({
        searchQuery: query,
        searchResults: [],
        searchError: {
          kind: "error",
          message: "Enter at least 2 characters to search.",
        },
      });
      return { success: false };
    }

    set({ searching: true, searchQuery: query, searchError: null, tab: "search" });
    try {
      const res = await aiApi.search(query, 10);
      if (res?.success && res.data) {
        set({
          searchResults: Array.isArray(res.data.results) ? res.data.results : [],
          searchReranked: Boolean(res.data.reranked),
          searching: false,
        });
        return { success: true };
      }
      set({
        searching: false,
        searchError: { kind: "error", message: res?.message || "Search failed." },
      });
      return { success: false };
    } catch (err) {
      set({ searching: false, searchError: getAiErrorInfo(err) });
      return { success: false };
    }
  },
}));

export default useAiStore;
