import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialNotices = [
  {
    id: 1,
    noticeId: "NOT-1001",
    title: "Water Supply Maintenance",
    category: "Maintenance",
    priority: "High",
    status: "Published",
    publishDate: "2026-07-10",
    expiryDate: "2026-07-15",
    description:
      "Water supply will remain unavailable from 10 AM to 2 PM due to maintenance work.",
    createdAt: new Date().toISOString(),
    updatedAt: null,
  },
  {
    id: 2,
    noticeId: "NOT-1002",
    title: "Annual General Meeting",
    category: "Meeting",
    priority: "Medium",
    status: "Published",
    publishDate: "2026-07-12",
    expiryDate: "2026-07-20",
    description:
      "Residents are requested to attend the Annual General Meeting in the clubhouse.",
    createdAt: new Date().toISOString(),
    updatedAt: null,
  },
  {
    id: 3,
    noticeId: "NOT-1003",
    title: "Parking Rule Update",
    category: "Parking",
    priority: "Low",
    status: "Draft",
    publishDate: "2026-07-18",
    expiryDate: "2026-07-30",
    description:
      "New parking allocation policy will come into effect from next month.",
    createdAt: new Date().toISOString(),
    updatedAt: null,
  },
];

const useNoticeStore = create(
  persist(
    (set, get) => ({
      notices: initialNotices,

      addNotice: (notice) =>
        set((state) => ({
          notices: [
            {
              ...notice,
              id: notice.id || Date.now(),
              noticeId: notice.noticeId || `NOT-${Date.now().toString().slice(-5)}`,
              createdAt: new Date().toISOString(),
              updatedAt: null,
            },
            ...state.notices,
          ],
        })),

      updateNotice: (updatedNotice) =>
        set((state) => ({
          notices: state.notices.map((notice) =>
            notice.id === updatedNotice.id
              ? {
                  ...notice,
                  ...updatedNotice,
                  updatedAt: new Date().toISOString(),
                }
              : notice
          ),
        })),

      deleteNotice: (id) =>
        set((state) => ({
          notices: state.notices.filter((notice) => notice.id !== id),
        })),

      getNoticeById: (id) => {
        return get().notices.find((notice) => notice.id === id);
      },

      resetNotices: () =>
        set({
          notices: initialNotices,
        }),
    }),
    {
      name: "notice-storage",
    }
  )
);

export default useNoticeStore;