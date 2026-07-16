import { create } from "zustand";
import { persist } from "zustand/middleware";
import useFacilityStore from "./facilityStore";

const initialBookings = [
  {
    id: 1,
    bookingId: "BK-1001",
    resident: "Rahul Sharma",
    flat: "A-101",
    facility: "Club House",
    date: "15 Jul 2026",
    time: "10:00 AM - 12:00 PM",
    guests: 25,
    amount: 2500,
    status: "Approved",
    paymentStatus: "Paid",
    description: "Birthday Celebration",
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    bookingId: "BK-1002",
    resident: "Aisha Khan",
    flat: "B-203",
    facility: "Swimming Pool",
    date: "18 Jul 2026",
    time: "05:00 PM - 07:00 PM",
    guests: 4,
    amount: 500,
    status: "Pending",
    paymentStatus: "Pending",
    description: "Family Swimming",
    createdAt: new Date().toISOString(),
  },
];

const syncToFacilityStore = (bookings) => {
  const facilityBookings = bookings.map((b) => ({
    id: b.id,
    facilityId: b.facility === "Club House" ? 1 : b.facility === "Swimming Pool" ? 2 : b.facility === "Gym" ? 3 : 4,
    facility: b.facility,
    date: b.date,
    time: b.time || b.slot,
    purpose: b.description || b.purpose,
    status: b.status,
    createdAt: b.createdAt,
    updatedAt: new Date().toISOString(),
    bookedBy: b.resident,
    flat: b.flat,
  }));
  useFacilityStore.setState({ bookings: facilityBookings });
};

const useBookingStore = create(
  persist(
    (set) => ({
      bookings: initialBookings,

      addBooking: (booking) =>
        set((state) => {
          const newBookings = [
            ...state.bookings,
            {
              ...booking,
              id: booking.id || Date.now(),
              createdAt: new Date().toISOString(),
            },
          ];
          setTimeout(() => syncToFacilityStore(newBookings), 0);
          return { bookings: newBookings };
        }),

      updateBooking: (updatedBooking) =>
        set((state) => {
          const newBookings = state.bookings.map((booking) =>
            booking.id === updatedBooking.id ? updatedBooking : booking
          );
          setTimeout(() => syncToFacilityStore(newBookings), 0);
          return { bookings: newBookings };
        }),

      deleteBooking: (id) =>
        set((state) => {
          const newBookings = state.bookings.filter((booking) => booking.id !== id);
          setTimeout(() => syncToFacilityStore(newBookings), 0);
          return { bookings: newBookings };
        }),

      resetBookings: () =>
        set(() => {
          setTimeout(() => syncToFacilityStore(initialBookings), 0);
          return { bookings: initialBookings };
        }),
    }),
    {
      name: "booking-storage",
    }
  )
);

export default useBookingStore;