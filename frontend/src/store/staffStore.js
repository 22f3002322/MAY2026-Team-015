import { create } from "zustand";
import { persist } from "zustand/middleware";

import { staff as initialStaff } from "../mock/staff";

const useStaffStore = create(
    persist(
        (set) => ({
            staff: initialStaff,

            addStaff: (staff) =>
                set((state) => ({
                    staff: [
                        ...state.staff,
                        {
                            ...staff,
                            id: crypto.randomUUID(),
                            createdAt: new Date().toISOString(),
                        },
                    ],
                })),

            updateStaff: (id, updatedData) =>
                set((state) => ({
                    staff: state.staff.map((employee) =>
                        employee.id === id
                            ? {
                                ...employee,
                                ...updatedData,
                            }
                            : employee
                    ),
                })),

            deleteStaff: (id) =>
                set((state) => ({
                    staff: state.staff.filter(
                        (employee) => employee.id !== id
                    ),
                })),

            resetStaff: () =>
                set({
                    staff: initialStaff,
                }),
        }),
        {
            name: "staff-storage",
        }
    )
);

export default useStaffStore;