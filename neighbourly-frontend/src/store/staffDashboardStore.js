import { create } from "zustand";
import { persist } from "zustand/middleware";

const generateId = () => crypto.randomUUID();
const now = () => new Date().toISOString();
const today = new Date().toISOString().split("T")[0];

const initialDeliveries = [
  { id: generateId(), recipientName: "Arjun Mehta", flat: "A-101", type: "Courier", provider: "Amazon", status: "Pending", createdAt: now(), notes: "" },
  { id: generateId(), recipientName: "Priya Sharma", flat: "B-204", type: "Food Delivery", provider: "Zomato", status: "Collected", createdAt: now(), notes: "" },
  { id: generateId(), recipientName: "Rahul Verma", flat: "C-302", type: "Courier", provider: "Flipkart", status: "Pending", createdAt: now(), notes: "" },
  { id: generateId(), recipientName: "Neha Gupta", flat: "A-403", type: "Parcel", provider: "Meesho", status: "Pending", createdAt: now(), notes: "" },
  { id: generateId(), recipientName: "Sanjay Patel", flat: "D-105", type: "Documents", provider: "BlueDart", status: "Collected", createdAt: now(), notes: "" },
];

const initialIncidents = [
  { id: generateId(), title: "Unauthorized vehicle in parking", description: "Unregistered car spotted in B-block parking at 2 AM", location: "B-Block Parking", severity: "Medium", status: "Open", reportedBy: "Night Patrol", createdAt: now() },
  { id: generateId(), title: "Fire alarm triggered - false alarm", description: "Fire alarm went off in C-block 3rd floor due to cooking smoke", location: "C-Block 3rd Floor", severity: "Low", status: "Resolved", reportedBy: "Guard Ravi", createdAt: now() },
  { id: generateId(), title: "Suspicious person near gate", description: "Unknown person loitering near main gate for over an hour", location: "Main Gate", severity: "High", status: "Open", reportedBy: "Guard Suresh", createdAt: now() },
];

const initialEmergencyContacts = [
  { id: generateId(), name: "Fire Department", phone: "101", category: "Emergency" },
  { id: generateId(), name: "Police Station (Local)", phone: "100", category: "Emergency" },
  { id: generateId(), name: "Ambulance", phone: "108", category: "Emergency" },
  { id: generateId(), name: "Society Manager - Mr. Kapoor", phone: "+91 98765 43210", category: "Management" },
  { id: generateId(), name: "Electrician - Ramesh", phone: "+91 87654 32109", category: "Maintenance" },
  { id: generateId(), name: "Plumber - Sunil", phone: "+91 76543 21098", category: "Maintenance" },
];

const initialCleaningTasks = [
  { id: generateId(), area: "A-Block Lobby", floor: "Ground Floor", type: "Regular", status: "Pending", assignedTo: "Ramu", scheduledDate: today, scheduledTime: "08:00", notes: "", completedAt: null },
  { id: generateId(), area: "B-Block Staircase", floor: "All Floors", type: "Deep Clean", status: "In Progress", assignedTo: "Sita", scheduledDate: today, scheduledTime: "09:00", notes: "Use disinfectant", completedAt: null },
  { id: generateId(), area: "Swimming Pool Area", floor: "Ground Floor", type: "Regular", status: "Completed", assignedTo: "Ramu", scheduledDate: today, scheduledTime: "07:00", notes: "", completedAt: now() },
  { id: generateId(), area: "C-Block Corridor", floor: "2nd Floor", type: "Regular", status: "Pending", assignedTo: "Geeta", scheduledDate: today, scheduledTime: "10:00", notes: "", completedAt: null },
  { id: generateId(), area: "Gym", floor: "Ground Floor", type: "Sanitization", status: "Pending", assignedTo: "Sita", scheduledDate: today, scheduledTime: "11:00", notes: "Post morning session", completedAt: null },
  { id: generateId(), area: "D-Block Lobby", floor: "Ground Floor", type: "Regular", status: "Completed", assignedTo: "Geeta", scheduledDate: today, scheduledTime: "06:30", notes: "", completedAt: now() },
  { id: generateId(), area: "Community Hall", floor: "1st Floor", type: "Deep Clean", status: "Pending", assignedTo: "Ramu", scheduledDate: today, scheduledTime: "14:00", notes: "Event scheduled tomorrow", completedAt: null },
];

const initialSchedule = [
  { id: generateId(), title: "Morning Patrol - A Block", time: "06:00 - 08:00", type: "patrol", status: "completed" },
  { id: generateId(), title: "Gate Duty - Main Entrance", time: "08:00 - 12:00", type: "gate", status: "active" },
  { id: generateId(), title: "Visitor Verification Round", time: "12:00 - 13:00", type: "verification", status: "upcoming" },
  { id: generateId(), title: "Afternoon Patrol - B & C Block", time: "14:00 - 16:00", type: "patrol", status: "upcoming" },
  { id: generateId(), title: "Evening Gate Duty", time: "16:00 - 20:00", type: "gate", status: "upcoming" },
];

const initialNotifications = [
  { id: generateId(), message: "New visitor expected at Gate 1 for flat A-201", type: "visitor", read: false, createdAt: now() },
  { id: generateId(), message: "Complaint #C-1042 assigned to maintenance team", type: "complaint", read: false, createdAt: now() },
  { id: generateId(), message: "Cleaning schedule updated for B-Block", type: "task", read: true, createdAt: now() },
  { id: generateId(), message: "Emergency drill scheduled for tomorrow 10 AM", type: "alert", read: false, createdAt: now() },
  { id: generateId(), message: "Delivery package uncollected for 24 hours - Flat C-302", type: "delivery", read: false, createdAt: now() },
];

const initialActivities = [
  { id: generateId(), action: "Approved visitor entry", details: "Ramesh Kumar for flat A-301", time: "10 min ago", type: "visitor" },
  { id: generateId(), action: "Completed cleaning", details: "D-Block Lobby", time: "25 min ago", type: "cleaning" },
  { id: generateId(), action: "Updated complaint status", details: "Complaint #C-1040 marked In Progress", time: "1 hour ago", type: "complaint" },
  { id: generateId(), action: "Registered delivery", details: "Amazon parcel for A-101", time: "2 hours ago", type: "delivery" },
  { id: generateId(), action: "Filed incident report", details: "Suspicious vehicle in parking", time: "3 hours ago", type: "incident" },
];

const useStaffDashboardStore = create(
  persist(
    (set, get) => ({
      // Data
      deliveries: initialDeliveries,
      incidents: initialIncidents,
      emergencyContacts: initialEmergencyContacts,
      cleaningTasks: initialCleaningTasks,
      schedule: initialSchedule,
      notifications: initialNotifications,
      activities: initialActivities,

      // Delivery actions
      addDelivery: (delivery) =>
        set((state) => ({
          deliveries: [...state.deliveries, { ...delivery, id: generateId(), createdAt: now() }],
        })),
      updateDelivery: (id, data) =>
        set((state) => ({
          deliveries: state.deliveries.map((d) => (d.id === id ? { ...d, ...data } : d)),
        })),
      deleteDelivery: (id) =>
        set((state) => ({
          deliveries: state.deliveries.filter((d) => d.id !== id),
        })),

      // Incident actions
      addIncident: (incident) =>
        set((state) => ({
          incidents: [...state.incidents, { ...incident, id: generateId(), createdAt: now() }],
        })),
      updateIncident: (id, data) =>
        set((state) => ({
          incidents: state.incidents.map((i) => (i.id === id ? { ...i, ...data } : i)),
        })),

      // Cleaning task actions
      addCleaningTask: (task) =>
        set((state) => ({
          cleaningTasks: [...state.cleaningTasks, { ...task, id: generateId(), completedAt: null }],
        })),
      updateCleaningTask: (id, data) =>
        set((state) => ({
          cleaningTasks: state.cleaningTasks.map((t) => (t.id === id ? { ...t, ...data } : t)),
        })),
      startCleaningTask: (id) =>
        set((state) => ({
          cleaningTasks: state.cleaningTasks.map((t) =>
            t.id === id ? { ...t, status: "In Progress" } : t
          ),
        })),
      completeCleaningTask: (id) =>
        set((state) => ({
          cleaningTasks: state.cleaningTasks.map((t) =>
            t.id === id ? { ...t, status: "Completed", completedAt: now() } : t
          ),
        })),

      // Notification actions
      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),
      markAllNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),

      // Activity actions
      addActivity: (activity) =>
        set((state) => ({
          activities: [{ ...activity, id: generateId() }, ...state.activities].slice(0, 20),
        })),

      // Emergency contact actions
      addEmergencyContact: (contact) =>
        set((state) => ({
          emergencyContacts: [...state.emergencyContacts, { ...contact, id: generateId() }],
        })),
      deleteEmergencyContact: (id) =>
        set((state) => ({
          emergencyContacts: state.emergencyContacts.filter((c) => c.id !== id),
        })),

      // Reset
      resetAll: () =>
        set({
          deliveries: initialDeliveries,
          incidents: initialIncidents,
          emergencyContacts: initialEmergencyContacts,
          cleaningTasks: initialCleaningTasks,
          schedule: initialSchedule,
          notifications: initialNotifications,
          activities: initialActivities,
        }),
    }),
    { name: "staff-dashboard-storage" }
  )
);

export default useStaffDashboardStore;
