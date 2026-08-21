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
            const mapped = res.data.map((f) => {
              const name =
                f.facility_name || f.name || `Facility #${f.facility_id || f.id}`;
              return {
                id: f.facility_id || f.id,
                facility_id: f.facility_id || f.id,
                name,
                facility_name: name,
                category: f.category || "Community",
                image:
                  f.image_url ||
                  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
                location: f.location || "Society premises",
                timings: `${String(f.opening_time || "08:00:00").slice(0, 5)} - ${String(f.closing_time || "22:00:00").slice(0, 5)}`,
                capacity: f.capacity ?? f.max_capacity ?? null,
                bookingRequired: true,
                available: f.is_active !== false,
                description: f.description || "",
              };
            });
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

      getBookingById: (id) =>
        get().bookings.find((booking) => booking.id === id),

      getFacilityById: (id) =>
        get().facilities.find(
          (facility) => facility.id === id || facility.facility_id === id
        ),

      resetBookings: () => set({ bookings: [] }),
    }),
    {
      name: "facility-storage",
    }
  )
);

export default useFacilityStore;
