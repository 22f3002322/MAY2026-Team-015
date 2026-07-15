import { create } from "zustand";
import { persist } from "zustand/middleware";

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
    date: "2026-07-20",
    time: "06:00 PM - 09:00 PM",
    purpose: "Birthday Party",
    status: "Approved",
    createdAt: new Date().toISOString(),
    updatedAt: null,
  },
  {
    id: 2,
    facilityId: 2,
    facility: "Swimming Pool",
    date: "2026-07-22",
    time: "07:00 AM - 08:00 AM",
    purpose: "Morning Session",
    status: "Pending",
    createdAt: new Date().toISOString(),
    updatedAt: null,
  },
];

const useFacilityStore = create(
  persist(
    (set, get) => ({
      facilities: initialFacilities,

      bookings: initialBookings,

      addBooking: (booking) =>
        set((state) => ({
          bookings: [
            ...state.bookings,
            {
              id: crypto.randomUUID(),
              status: "Pending",
              createdAt:
                new Date().toISOString(),
              updatedAt: null,
              ...booking,
            },
          ],
        })),

      updateBooking: (
        id,
        updatedBooking
      ) =>
        set((state) => ({
          bookings: state.bookings.map(
            (booking) =>
              booking.id === id
                ? {
                    ...booking,
                    ...updatedBooking,
                    updatedAt:
                      new Date().toISOString(),
                  }
                : booking
          ),
        })),

      deleteBooking: (id) =>
        set((state) => ({
          bookings:
            state.bookings.filter(
              (booking) =>
                booking.id !== id
            ),
        })),

      approveBooking: (id) =>
        set((state) => ({
          bookings: state.bookings.map(
            (booking) =>
              booking.id === id
                ? {
                    ...booking,
                    status: "Approved",
                    updatedAt:
                      new Date().toISOString(),
                  }
                : booking
          ),
        })),

      rejectBooking: (id) =>
        set((state) => ({
          bookings: state.bookings.map(
            (booking) =>
              booking.id === id
                ? {
                    ...booking,
                    status: "Rejected",
                    updatedAt:
                      new Date().toISOString(),
                  }
                : booking
          ),
        })),

      getBookingById: (id) =>
        get().bookings.find(
          (booking) =>
            booking.id === id
        ),

      getFacilityById: (id) =>
        get().facilities.find(
          (facility) =>
            facility.id === id
        ),

      resetBookings: () =>
        set({
          bookings: initialBookings,
        }),
    }),
    {
      name: "facility-storage",
    }
  )
);

export default useFacilityStore;