import { create } from "zustand";
import { persist } from "zustand/middleware";
import useFacilityStore from "./facilityStore";
import facilityApi from "../api/facilityApi";

const syncToFacilityStore = (bookings) => {
  const facilityBookings = bookings.map((b) => ({
    id: b.booking_id || b.id,
    facilityId: b.facility_id || (b.facility === "Club House" ? 1 : b.facility === "Swimming Pool" ? 2 : b.facility === "Gym" ? 3 : 4),
    facility: b.facility || `Facility #${b.facility_id}`,
    date: b.booking_date || b.date,
    time: b.time_slot || b.time || `${b.start_time?.slice(0, 5)} - ${b.end_time?.slice(0, 5)}`,
    purpose: b.description || b.purpose,
    status: b.status,
    createdAt: b.createdAt || b.created_at,
    updatedAt: new Date().toISOString(),
    bookedBy: b.resident || `Resident #${b.resident_id}`,
    flat: b.flat || "A-101",
  }));
  useFacilityStore.setState({ bookings: facilityBookings });
};

const useBookingStore = create(
  persist(
    (set, get) => ({
      bookings: [],
      facilities: [],
      loading: false,

      // Fetch bookings from backend API
      fetchBookings: async () => {
        set({ loading: true });
        try {
          const res = await facilityApi.getBookings();
          if (res && res.success && Array.isArray(res.data)) {
            set({ bookings: res.data, loading: false });
            syncToFacilityStore(res.data);
            return { success: true, data: res.data };
          }
        } catch (err) {
          console.warn("Backend bookings fetch failed:", err.message);
        }
        set({ loading: false });
        return { success: false, data: get().bookings };
      },

      // Fetch facilities list from backend API (Admin/Committee only)
      fetchFacilities: async () => {
        try {
          const res = await facilityApi.getFacilities();
          if (res && res.success && Array.isArray(res.data)) {
            set({ facilities: res.data });
          }
        } catch (err) {
          console.warn("Backend facilities fetch failed (expected for non-admin):", err.message);
        }
      },

      addBooking: async (booking) => {
        try {
          const payload = {
            facility_id: Number(booking.facilityId || booking.facility_id || 1),
            booking_date: booking.date || booking.booking_date || new Date().toISOString().split("T")[0],
            start_time: booking.startTime || "10:00:00",
            end_time: booking.endTime || "12:00:00",
          };
          const res = await facilityApi.createBooking(payload);
          if (res && res.success) {
            await get().fetchBookings();
            return { success: true, data: res.data, message: res.message };
          }
          return { success: false, message: res?.message || "Booking failed." };
        } catch (err) {
          return { success: false, message: err.message || "Failed to book facility." };
        }
      },

      updateBooking: async (updatedBooking) => {
        try {
          const id = updatedBooking.booking_id || updatedBooking.id;
          const res = await facilityApi.updateBooking(id, {
            status: updatedBooking.status,
          });
          if (res && res.success) {
            await get().fetchBookings();
            return { success: true, data: res.data };
          }
        } catch (err) {
          console.warn("Backend booking update failed:", err.message);
          return { success: false, message: err.message };
        }
      },

      deleteBooking: async (id) => {
        try {
          // Backend booking cancel is done via patch status
          const res = await facilityApi.updateBooking(id, { status: "Cancelled" });
          if (res && res.success) {
            await get().fetchBookings();
            return { success: true };
          }
        } catch (err) {
          console.warn("Cancel booking failed:", err.message);
          return { success: false, message: err.message };
        }
      },

      resetBookings: () => set({ bookings: [], facilities: [] }),
    }),
    { name: "booking-storage" }
  )
);

export default useBookingStore;