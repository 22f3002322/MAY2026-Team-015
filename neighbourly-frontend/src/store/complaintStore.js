import { create } from "zustand";
import { persist } from "zustand/middleware";

import { complaints as initialComplaints } from "../mock/complaints";

const useComplaintStore = create(
    persist(
        (set) => ({
            complaints: initialComplaints,

            addComplaint: (complaint) =>
                set((state) => ({
                    complaints: [
                        ...state.complaints,
                        {
                            ...complaint,
                            id: crypto.randomUUID(),
                            createdAt: new Date().toISOString(),
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