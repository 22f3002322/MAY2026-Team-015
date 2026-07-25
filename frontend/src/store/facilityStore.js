import { create } from "zustand";
import { persist } from "zustand/middleware";
import useBookingStore from "./bookingStore";

const initialFacilities = [
  {
    id: 1,
    name: "Club House",
    category: "Community",
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
    location: "Block A",
    timings: "06:00 AM - 10:00 PM",
    capacity: 150,
    bookingRequired: true,
    available: true,
    description:
      "Ideal for birthdays, meetings and family gatherings.",
  },
  {
    id: 2,
    name: "Swimming Pool",
    category: "Sports",
    image:
      "https://images.unsplash.com/photo-1576013551627-0ae7d9c5f2d1?w=800",
    location: "Central Park",
    timings: "06:00 AM - 09:00 PM",
    capacity: 50,
    bookingRequired: true,
    available: true,
    description:
      "Olympic-style swimming pool for residents.",
  },
  {
    id: 3,
    name: "Gym",
    category: "Fitness",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800",
    location: "Club House",
    timings: "05:00 AM - 11:00 PM",
    capacity: 40,
    bookingRequired: false,
    available: true,
    description:
      "Fully equipped modern fitness center.",
  },
  {
    id: 4,
    name: "Badminton Court",
    category: "Sports",
    image:
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800",
    location: "Sports Arena",
    timings: "06:00 AM - 10:00 PM",
    capacity: 8,
    bookingRequired: true,
    available: true,
    description:
      "Indoor badminton courts with wooden flooring.",
  },
];

const initialBookings = [
  {
    id: 1,
    facilityId: 1,
    facility: "Club House",
    date: "15 Jul 2026",
    time: "10:00 AM - 12:00 PM",
    purpose: "Birthday Party",
    status: "Approved",
    createdAt: new Date().toISOString(),
    updatedAt: null,
    bookedBy: "Rahul Sharma",
    flat: "A-101",
  },
  {
    id: 2,
    facilityId: 2,
    facility: "Swimming Pool",
    date: "18 Jul 2026",
    time: "05:00 PM - 07:00 PM",
    purpose: "Family Swimming",
    status: "Pending",
    createdAt: new Date().toISOString(),
    updatedAt: null,
    bookedBy: "Aisha Khan",
    flat: "B-203",
  },
];

const syncToBookingStore = (bookings) => {
  const adminBookings = bookings.map((b) => ({
    id: b.id,
    bookingId: b.bookingId || `BK-${b.id}`,
    resident: b.bookedBy || b.resident || "Resident",
    flat: b.flat || "A-101",
    facility: b.facility,
    date: b.date,
    time: b.time || b.slot,
    guests: b.guests || 1,
    amount: b.amount || 200,
    status: b.status,
    paymentStatus: b.paymentStatus || (b.status === "Approved" ? "Paid" : "Pending"),
    description: b.purpose || b.description,
    createdAt: b.createdAt,
  }));
  useBookingStore.setState({ bookings: adminBookings });
};

const useFacilityStore = create(
  persist(
    (set, get) => ({
      facilities: initialFacilities,

      bookings: initialBookings,

      addBooking: (booking) =>
        set((state) => {
          const newBookings = [
            ...state.bookings,
            {
              id: booking.id || crypto.randomUUID(),
              status: "Pending",
              createdAt: new Date().toISOString(),
              updatedAt: null,
              ...booking,
            },
          ];
          setTimeout(() => syncToBookingStore(newBookings), 0);
          return { bookings: newBookings };
        }),

      updateBooking: (id, updatedBooking) =>
        set((state) => {
          const newBookings = state.bookings.map((booking) =>
            booking.id === id
              ? {
                  ...booking,
                  ...updatedBooking,
                  updatedAt: new Date().toISOString(),
                }
              : booking
          );
          setTimeout(() => syncToBookingStore(newBookings), 0);
          return { bookings: newBookings };
        }),

      deleteBooking: (id) =>
        set((state) => {
          const newBookings = state.bookings.filter((booking) => booking.id !== id);
          setTimeout(() => syncToBookingStore(newBookings), 0);
          return { bookings: newBookings };
        }),

      approveBooking: (id) =>
        set((state) => {
          const newBookings = state.bookings.map((booking) =>
            booking.id === id
              ? {
                  ...booking,
                  status: "Approved",
                  updatedAt: new Date().toISOString(),
                }
              : booking
          );
          setTimeout(() => syncToBookingStore(newBookings), 0);
          return { bookings: newBookings };
        }),

      rejectBooking: (id) =>
        set((state) => {
          const newBookings = state.bookings.map((booking) =>
            booking.id === id
              ? {
                  ...booking,
                  status: "Rejected",
                  updatedAt: new Date().toISOString(),
                }
              : booking
          );
          setTimeout(() => syncToBookingStore(newBookings), 0);
          return { bookings: newBookings };
        }),

      getBookingById: (id) =>
        get().bookings.find((booking) => booking.id === id),

      getFacilityById: (id) =>
        get().facilities.find((facility) => facility.id === id),

      resetBookings: () =>
        set(() => {
          setTimeout(() => syncToBookingStore(initialBookings), 0);
          return { bookings: initialBookings };
        }),
    }),
    {
      name: "facility-storage",
    }
  )
);

export default useFacilityStore;