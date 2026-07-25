import { create } from "zustand";
import { persist } from "zustand/middleware";

import { residents as initialResidents } from "../mock/residents";

const useResidentStore = create(
    persist(
        (set) => ({
            residents: initialResidents,

            addResident: (resident) =>
                set((state) => ({
                    residents: [
                        ...state.residents,
                        {
                            ...resident,
                            id: crypto.randomUUID(),
                            createdAt: new Date().toISOString(),
                        },
                    ],
                })),

            updateResident: (id, updatedResident) =>
                set((state) => ({
                    residents: state.residents.map((resident) =>
                        resident.id === id
                            ? {
                                ...resident,
                                ...updatedResident,
                            }
                            : resident
                    ),
                })),

            deleteResident: (id) =>
                set((state) => ({
                    residents: state.residents.filter(
                        (resident) => resident.id !== id
                    ),
                })),

            resetResidents: () =>
                set({
                    residents: initialResidents,
                }),
        }),
        {
            name: "resident-storage",
        }
    )
);

export default useResidentStore;