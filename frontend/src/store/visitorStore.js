import { create } from "zustand";
import { persist } from "zustand/middleware";

import { visitors as initialVisitors } from "../mock/visitors";

const useVisitorStore = create(
  persist(
    (set) => ({
      visitors: initialVisitors,

      addVisitor: (visitor) =>
        set((state) => ({
          visitors: [
            ...state.visitors,
            {
              ...visitor,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      updateVisitor: (id, updatedData) =>
        set((state) => ({
          visitors: state.visitors.map((visitor) =>
            visitor.id === id
              ? { ...visitor, ...updatedData }
              : visitor
          ),
        })),

      deleteVisitor: (id) =>
        set((state) => ({
          visitors: state.visitors.filter(
            (visitor) => visitor.id !== id
          ),
        })),

      resetVisitors: () =>
        set({
          visitors: initialVisitors,
        }),
    }),
    {
      name: "visitor-storage",
    }
  )
);

export default useVisitorStore;