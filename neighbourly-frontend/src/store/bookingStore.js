import { create } from "zustand";

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

const useBookingStore = create((set) => ({
  bookings: initialBookings,

  addBooking: (booking) =>
    set((state) => ({
      bookings: [
        ...state.bookings,
        {
          ...booking,
          id: Date.now(),
          createdAt: new Date().toISOString(),
        },
      ],
    })),

  updateBooking: (updatedBooking) =>
    set((state) => ({
      bookings: state.bookings.map((booking) =>
        booking.id === updatedBooking.id
          ? updatedBooking
          : booking
      ),
    })),

  deleteBooking: (id) =>
    set((state) => ({
      bookings: state.bookings.filter(
        (booking) => booking.id !== id
      ),
    })),
}));

export default useBookingStore;