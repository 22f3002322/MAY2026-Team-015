import { create } from "zustand";
import { persist } from "zustand/middleware";

import { apartments as initialApartments } from "../mock/apartments";

const useApartmentStore = create(
  persist(
    (set) => ({
      apartments: initialApartments,

      addApartment: (apartment) =>
        set((state) => ({
          apartments: [
            ...state.apartments,
            {
              ...apartment,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      updateApartment: (id, updatedApartment) =>
        set((state) => ({
          apartments: state.apartments.map((apartment) =>
            apartment.id === id
              ? {
                ...apartment,
                ...updatedApartment,
                updatedAt: new Date().toISOString(),
              }
              : apartment
          ),
        })),

      deleteApartment: (id) =>
        set((state) => ({
          apartments: state.apartments.filter(
            (apartment) => apartment.id !== id
          ),
        })),

      resetApartments: () =>
        set({
          apartments: initialApartments,
        }),
    }),
    {
      name: "apartments-storage",
    }
  )
);

export default useApartmentStore;