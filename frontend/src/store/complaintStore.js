import { create } from "zustand";
import { persist } from "zustand/middleware";

import { complaints as initialComplaints } from "../mock/complaints";

const useComplaintStore = create(
  persist(
    (set, get) => ({
      complaints: initialComplaints,

      addComplaint: (complaint) =>
        set((state) => ({
          complaints: [
            ...state.complaints,
            {
              ...complaint,
              id: crypto.randomUUID(),
              status: complaint.status || "Open",
              assignedTo: complaint.assignedTo || "",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),

      updateComplaint: (id, updatedData) =>
        set((state) => ({
          complaints: state.complaints.map((complaint) =>
            complaint.id === id
              ? {
                  ...complaint,
                  ...updatedData,
                  updatedAt: new Date().toISOString(),
                }
              : complaint
          ),
        })),

      deleteComplaint: (id) =>
        set((state) => ({
          complaints: state.complaints.filter(
            (complaint) => complaint.id !== id
          ),
        })),

      assignComplaint: (id, assignedTo) =>
        set((state) => ({
          complaints: state.complaints.map((complaint) =>
            complaint.id === id
              ? {
                  ...complaint,
                  assignedTo,
                  status: "Assigned",
                  updatedAt: new Date().toISOString(),
                }
              : complaint
          ),
        })),

      updateStatus: (id, status) =>
        set((state) => ({
          complaints: state.complaints.map((complaint) =>
            complaint.id === id
              ? {
                  ...complaint,
                  status,
                  updatedAt: new Date().toISOString(),
                }
              : complaint
          ),
        })),

      getComplaintById: (id) =>
        get().complaints.find(
          (complaint) => complaint.id === id
        ),

      getComplaintsByResident: (residentName) =>
        get().complaints.filter(
          (complaint) =>
            complaint.resident === residentName
        ),

      resetComplaints: () =>
        set({
          complaints: initialComplaints,
        }),
    }),
    {
      name: "complaint-storage",
    }
  )
);

export default useComplaintStore;