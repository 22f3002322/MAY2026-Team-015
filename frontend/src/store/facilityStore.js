import { create } from "zustand";
import { persist } from "zustand/middleware";
import useBookingStore from "./bookingStore";
import facilityApi from "../api/facilityApi";

const useFacilityStore = create(
  persist(
    (set, get) => ({
      facilities: [],
      bookings: [],
      loading: false,

      fetchFacilities: async () => {
        set({ loading: true });
        try {
          const res = await facilityApi.getFacilities();
          if (res && res.success && Array.isArray(res.data)) {
            const mapped = res.data.map((f) => ({
              id: f.facility_id,
              name: f.name,
              category: f.description?.includes("Gym") ? "Fitness" : "Community",
              image: f.image_url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
              location: "Main Grounds",
              timings: `${f.opening_time} - ${f.closing_time}`,
              capacity: f.max_capacity || 100,
              bookingRequired: true,
              available: f.is_active,
              description: f.description || "",
            }));
            set({ facilities: mapped, loading: false });
            return { success: true, data: mapped };
          }
        } catch (err) {
          console.warn("Backend facilities fetch failed:", err.message);
        }
        set({ facilities: [], loading: false });
        return { success: false, data: [] };
      },

      addBooking: async (booking) => {
        const store = useBookingStore.getState();
        return store.addBooking(booking);
      },

      updateBooking: async (id, updatedBooking) => {
        const store = useBookingStore.getState();
        return store.updateBooking({ booking_id: id, ...updatedBooking });
      },

      deleteBooking: async (id) => {
        const store = useBookingStore.getState();
        return store.deleteBooking(id);
      },

      approveBooking: async (id) => {
        const store = useBookingStore.getState();
        return store.updateBooking({ booking_id: id, status: "Approved" });
      },

      rejectBooking: async (id) => {
        const store = useBookingStore.getState();
        return store.updateBooking({ booking_id: id, status: "Rejected" });
      },

      getBookingById: (id) =>
        get().bookings.find((booking) => booking.id === id),

      getFacilityById: (id) =>
        get().facilities.find((facility) => facility.id === id || facility.facility_id === id),

      resetBookings: () => set({ bookings: [] }),
    }),
    {
      name: "facility-storage",
    }
  )
);

export default useFacilityStore;