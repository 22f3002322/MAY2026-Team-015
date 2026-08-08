import { create } from "zustand";
import { persist } from "zustand/middleware";


import apartmentApi from "../api/apartmentApi";

const useApartmentStore = create(
  persist(
    (set, get) => ({
      apartments: [],
      blocks: [],
      flats: [],
      residents: [],       // backend resident directory
      occupancyHistory: {}, // keyed by resident_id
      loading: false,

      // ── Blocks ──────────────────────────────────────────────────────────
      fetchBlocks: async () => {
        try {
          const res = await apartmentApi.getBlocks();
          if (res && res.success && Array.isArray(res.data)) {
            set({ blocks: res.data });
            return { success: true, data: res.data };
          }
        } catch (err) {
          console.warn("Backend blocks fetch failed:", err.message);
        }
        return { success: false, data: get().blocks };
      },

      createBlock: async (blockData) => {
        try {
          const res = await apartmentApi.createBlock({
            block_name: blockData.block_name || blockData.name,
            total_flats: Number(blockData.total_flats || blockData.flatsCount || 10),
          });
          if (res && res.success) {
            get().fetchBlocks();
            return { success: true, data: res.data };
          }
          return { success: false, message: res?.message || "Failed." };
        } catch (err) {
          return { success: false, message: err.message || "Failed to create block." };
        }
      },

      updateBlock: async (blockId, payload) => {
        try {
          const res = await apartmentApi.updateBlock(blockId, payload);
          if (res && res.success) {
            get().fetchBlocks();
            return { success: true, data: res.data };
          }
          return { success: false, message: res?.message || "Update failed." };
        } catch (err) {
          return { success: false, message: err.message || "Failed to update block." };
        }
      },

      deleteBlock: async (blockId) => {
        try {
          const res = await apartmentApi.deleteBlock(blockId);
          if (res && res.success) {
            get().fetchBlocks();
            return { success: true };
          }
          return { success: false, message: res?.message || "Delete failed." };
        } catch (err) {
          return { success: false, message: err.message || "Failed to delete block." };
        }
      },

      // ── Flats ────────────────────────────────────────────────────────────
      fetchFlats: async (params = {}) => {
        set({ loading: true });
        try {
          const res = await apartmentApi.getFlats(params);
          if (res && res.success && Array.isArray(res.data)) {
            set({ flats: res.data, loading: false });
            return { success: true, data: res.data };
          }
        } catch (err) {
          console.warn("Backend flats fetch failed:", err.message);
        }
        set({ loading: false });
        return { success: false, data: get().flats };
      },

      createFlat: async (flatData) => {
        try {
          const res = await apartmentApi.createFlat({
            block_id:    Number(flatData.block_id || 1),
            flat_number: flatData.flat_number || flatData.number,
            floor_number: Number(flatData.floor_number || 1),
            flat_type:   flatData.flat_type || "2BHK",
          });
          if (res && res.success) {
            get().fetchFlats();
            return { success: true, data: res.data };
          }
          return { success: false, message: res?.message || "Failed." };
        } catch (err) {
          return { success: false, message: err.message || "Failed to create flat." };
        }
      },

      updateFlat: async (flatId, payload) => {
        try {
          const res = await apartmentApi.updateFlat(flatId, payload);
          if (res && res.success) {
            get().fetchFlats();
            return { success: true, data: res.data };
          }
          return { success: false, message: res?.message || "Update failed." };
        } catch (err) {
          return { success: false, message: err.message || "Failed to update flat." };
        }
      },

      // ── Resident Directory (Admin / Committee) ────────────────────────────
      fetchResidents: async (params = {}) => {
        set({ loading: true });
        try {
          const res = await apartmentApi.getResidents(params);
          if (res && res.success && Array.isArray(res.data)) {
            set({ residents: res.data, loading: false });
            return { success: true, data: res.data };
          }
        } catch (err) {
          console.warn("Backend residents fetch failed:", err.message);
        }
        set({ loading: false });
        return { success: false, data: get().residents };
      },

      // Edit emergency_contact / alternate_phone / occupation only
      updateResidentProfile: async (residentId, payload) => {
        try {
          const res = await apartmentApi.updateResident(residentId, payload);
          if (res && res.success) {
            // refresh directory
            get().fetchResidents();
            return { success: true, data: res.data, message: res.message };
          }
          return { success: false, message: res?.message || "Update failed." };
        } catch (err) {
          return { success: false, message: err.message || "Failed to update resident." };
        }
      },

      // Move resident into a flat
      moveInResident: async (residentId, flatId, occupancyType = "Owner", moveInDate = null) => {
        try {
          const body = { flat_id: Number(flatId), occupancy_type: occupancyType };
          if (moveInDate) body.move_in_date = moveInDate;
          const res = await apartmentApi.moveIn(residentId, body);
          if (res && res.success) {
            get().fetchResidents();
            get().fetchFlats();
            return { success: true, data: res.data, message: res.message };
          }
          return { success: false, message: res?.message || "Move-in failed." };
        } catch (err) {
          return { success: false, message: err.message || "Failed to move in resident." };
        }
      },

      // Move resident out of current flat
      moveOutResident: async (residentId, moveOutDate = null) => {
        try {
          const body = moveOutDate ? { move_out_date: moveOutDate } : {};
          const res = await apartmentApi.moveOut(residentId, body);
          if (res && res.success) {
            get().fetchResidents();
            get().fetchFlats();
            return { success: true, data: res.data, message: res.message };
          }
          return { success: false, message: res?.message || "Move-out failed." };
        } catch (err) {
          return { success: false, message: err.message || "Failed to move out resident." };
        }
      },

      // Fetch occupancy history for a single resident
      fetchOccupancyHistory: async (residentId) => {
        try {
          const res = await apartmentApi.getOccupancyHistory(residentId);
          if (res && res.success && Array.isArray(res.data)) {
            set((state) => ({
              occupancyHistory: {
                ...state.occupancyHistory,
                [residentId]: res.data,
              },
            }));
            return { success: true, data: res.data };
          }
        } catch (err) {
          console.warn("Occupancy history fetch failed:", err.message);
        }
        return { success: false, data: [] };
      },

      // ── Local (mock) fallbacks kept for offline use ───────────────────────
      addApartment: (apartment) =>
        set((state) => ({
          apartments: [
            ...state.apartments,
            { ...apartment, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
          ],
        })),

      updateApartment: (id, updatedApartment) =>
        set((state) => ({
          apartments: state.apartments.map((a) =>
            a.id === id ? { ...a, ...updatedApartment, updatedAt: new Date().toISOString() } : a
          ),
        })),

      deleteApartment: (id) =>
        set((state) => ({
          apartments: state.apartments.filter((a) => a.id !== id),
        })),

      resetApartments: () =>
        set({ apartments: [], blocks: [], flats: [], residents: [], occupancyHistory: {} }),
    }),
    { name: "apartments-storage" }
  )
);

export default useApartmentStore;