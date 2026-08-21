import { create } from "zustand";
import { persist } from "zustand/middleware";
import useFacilityStore from "./facilityStore";
import facilityApi from "../api/facilityApi";
import { BOOKING_STATUS, labelFor } from "../utils/adminMaps";

const syncToFacilityStore = (bookings) => {
  const facilityBookings = bookings.map((b) => {
    const statusValue = String(b.status || "").toLowerCase();
    return {
      id: b.booking_id || b.id,
      facilityId: b.facility_id,
      facility:
        b.facility_name || b.facility || `Facility #${b.facility_id}`,
      date: b.booking_date || b.date,
      time:
        b.time_slot ||
        b.time ||
        `${String(b.start_time || "").slice(0, 5)} - ${String(b.end_time || "").slice(0, 5)}`,
      guests: b.guest_count ?? b.guests ?? null,
      guest_count: b.guest_count ?? b.guests ?? null,
      status: labelFor(BOOKING_STATUS, statusValue) || statusValue,
      statusValue,
      createdAt: b.created_at || b.createdAt,
      updatedAt: b.updated_at || b.updatedAt || null,
      bookedBy: b.resident_name || b.resident || `Resident #${b.resident_id}`,
      flat: b.flat_number || b.flat || "—",
    };
  });
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
          const guests = booking.guest_count ?? booking.guests;
          if (guests != null && guests !== "") {
            payload.guest_count = Number(guests);
          }
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
          const res = await facilityApi.updateBooking(id, { status: "cancelled" });
          if (res && res.success) {
            await get().fetchBookings();
            return { success: true };
          }
          return { success: false, message: res?.message || "Cancel failed." };
        } catch (err) {
          console.warn("Cancel booking failed:", err.message);
          return { success: false, message: err.message };
        }
      },

      approveBooking: async (id) => {
        try {
          const res = await facilityApi.updateBooking(id, { status: "approved" });
          if (res && res.success) {
            await get().fetchBookings();
            return { success: true };
          }
          return { success: false, message: res?.message || "Approve failed." };
        } catch (err) {
          return { success: false, message: err.message };
        }
      },

      resetBookings: () => set({ bookings: [], facilities: [] }),
    }),
    { name: "booking-storage" }
  )
);

export default useBookingStore;