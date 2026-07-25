import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialEvents = [
    {
        id: 1,
        title: "Independence Day Celebration",
        category: "Festival",
        date: "2026-08-15",
        time: "08:00 AM - 11:00 AM",
        venue: "Club House",
        organizer: "Society Committee",
        image:
            "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=900",
        description:
            "Join us for flag hoisting, cultural performances and breakfast with all residents.",
        seats: 300,
        registered: 185,
        registrationOpen: true,
    },
    {
        id: 2,
        title: "Yoga Session",
        category: "Health",
        date: "2026-07-28",
        time: "06:30 AM - 08:00 AM",
        venue: "Central Lawn",
        organizer: "Fitness Club",
        image:
            "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=900",
        description:
            "Morning yoga session with certified instructors.",
        seats: 50,
        registered: 28,
        registrationOpen: true,
    },
    {
        id: 3,
        title: "Blood Donation Camp",
        category: "Social",
        date: "2026-08-02",
        time: "09:00 AM - 02:00 PM",
        venue: "Community Hall",
        organizer: "Red Cross",
        image:
            "https://images.unsplash.com/photo-1584515933487-779824d29309?w=900",
        description:
            "Donate blood and help save lives.",
        seats: 100,
        registered: 61,
        registrationOpen: true,
    },
];

const initialRegistrations = [
    {
        id: crypto.randomUUID(),
        eventId: 2,
        eventTitle: "Yoga Session",
        members: 2,
        registeredAt: new Date().toISOString(),
    },
];

const useEventStore = create(
    persist(
        (set, get) => ({
            events: initialEvents,

            registrations:
                initialRegistrations,

            registerEvent: (
                event,
                members,
                remarks = ""
            ) =>
                set((state) => ({
                    registrations: [
                        ...state.registrations,
                        {
                            id: crypto.randomUUID(),
                            eventId: event.id,
                            eventTitle: event.title,
                            members,
                            remarks,
                            registeredAt:
                                new Date().toISOString(),
                        },
                    ],

                    events: state.events.map((e) =>
                        e.id === event.id
                            ? {
                                ...e,
                                registered:
                                    e.registered +
                                    Number(members),
                            }
                            : e
                    ),
                })),
            cancelRegistration: (registrationId) =>
                set((state) => {
                    const registration =
                        state.registrations.find(
                            (r) => r.id === registrationId
                        );

                    if (!registration)
                        return state;

                    return {
                        registrations:
                            state.registrations.filter(
                                (r) =>
                                    r.id !== registrationId
                            ),

                        events: state.events.map(
                            (event) =>
                                event.id ===
                                    registration.eventId
                                    ? {
                                        ...event,
                                        registered:
                                            Math.max(
                                                0,
                                                event.registered -
                                                registration.members
                                            ),
                                    }
                                    : event
                        ),
                    };
                }),
            getEventById: (id) =>
                get().events.find(
                    (event) =>
                        event.id === id
                ),
        }),
        {
            name: "event-storage",
        }
    )
);

export default useEventStore;