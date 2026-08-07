import { create } from "zustand";
import { persist } from "zustand/middleware";
import useBookingStore from "./bookingStore";
import facilityApi from "../api/facilityApi";

const initialFacilities = [
  {
    id: 1,
    name: "Club House",
    category: "Community",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
    location: "Block A",
    timings: "06:00 AM - 10:00 PM",
    capacity: 150,
    bookingRequired: true,
    available: true,
    description: "Ideal for birthdays, meetings and family gatherings.",
  },
  {
    id: 2,
    name: "Swimming Pool",
    category: "Sports",
    image: "https://images.unsplash.com/photo-1576013551627-0ae7d9c5f2d1?w=800",
    location: "Central Park",
    timings: "06:00 AM - 09:00 PM",
    capacity: 50,
    bookingRequired: true,
    available: true,
    description: "Olympic-style swimming pool for residents.",
  },
  {
    id: 3,
    name: "Gym",
    category: "Fitness",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800",
    location: "Club House",
    timings: "05:00 AM - 11:00 PM",
    capacity: 40,
    bookingRequired: false,
    available: true,
    description: "Fully equipped modern fitness center.",
  },
  {
    id: 4,
    name: "Badminton Court",
    category: "Sports",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800",
    location: "Sports Arena",
    timings: "06:00 AM - 10:00 PM",
    capacity: 8,
    bookingRequired: true,
    available: true,
    description: "Indoor badminton courts with wooden flooring.",
  },
];

const useFacilityStore = create(
  persist(
    (set, get) => ({
      facilities: initialFacilities,
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
          console.warn("Backend facilities fetch failed, using default list:", err.message);
        }
        set({ facilities: initialFacilities, loading: false });
        return { success: true, data: initialFacilities };
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