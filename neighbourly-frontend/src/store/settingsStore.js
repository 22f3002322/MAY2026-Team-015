import { create } from "zustand";
import { persist } from "zustand/middleware";

const defaultProfile = {
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+91 9876543210",
  designation: "Committee Admin",
  avatar: null,
};

const defaultSociety = {
  societyName: "Green Valley Residency",
  registrationNo: "GVR-2022-001",
  address:
    "123 Green Valley Road, Bengaluru, Karnataka",
  contactEmail: "info@greenvalley.com",
  contactPhone: "+91 9876543210",
};

const defaultNotifications = {
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: true,
  complaintAlerts: true,
  visitorAlerts: true,
  billingAlerts: false,
};

const defaultSecurity = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
  twoFactor: false,
  autoLogout: true,
  sessionTimeout: "30",
};

const defaultAppearance = {
  theme: "Light",
  primaryColor: "Indigo",
  sidebar: "Expanded",
  density: "Comfortable",
};

const defaultEmergencyContacts = [
  {
    id: crypto.randomUUID(),
    name: "Society Security",
    phone: "+91 9876543210",
    role: "Security",
  },
  {
    id: crypto.randomUUID(),
    name: "Maintenance Office",
    phone: "+91 9876500000",
    role: "Maintenance",
  },
];

const defaultSupportTickets = [
  {
    id: crypto.randomUUID(),
    subject: "Water Leakage",
    category: "Maintenance",
    status: "Open",
    createdAt: new Date().toISOString(),
  },
];

const useSettingsStore = create(
  persist(
    (set, get) => ({
      profile: defaultProfile,

      society: defaultSociety,

      notifications:
        defaultNotifications,

      security:
        defaultSecurity,

      appearance:
        defaultAppearance,

      emergencyContacts:
        defaultEmergencyContacts,

      supportTickets:
        defaultSupportTickets,
            // ==========================
      // Profile
      // ==========================

      updateProfile: (data) =>
        set((state) => ({
          profile: {
            ...state.profile,
            ...data,
          },
        })),

      // ==========================
      // Society
      // ==========================

      updateSociety: (data) =>
        set((state) => ({
          society: {
            ...state.society,
            ...data,
          },
        })),

      // ==========================
      // Notifications
      // ==========================

      updateNotifications: (data) =>
        set((state) => ({
          notifications: {
            ...state.notifications,
            ...data,
          },
        })),

      toggleNotification: (field) =>
        set((state) => ({
          notifications: {
            ...state.notifications,
            [field]:
              !state.notifications[field],
          },
        })),

      getNotificationCount: () =>
        Object.values(
          get().notifications
        ).filter(Boolean).length,
              
      // ==========================
      // Security
      // ==========================

      updateSecurity: (data) =>
        set((state) => ({
          security: {
            ...state.security,
            ...data,
          },
        })),

      toggleSecurity: (field) =>
        set((state) => ({
          security: {
            ...state.security,
            [field]:
              !state.security[field],
          },
        })),

      getSecurityStatus: () =>
        get().security.twoFactor
          ? "Enabled"
          : "Disabled",

      // ==========================
      // Appearance
      // ==========================

      updateAppearance: (data) =>
        set((state) => ({
          appearance: {
            ...state.appearance,
            ...data,
          },
        })),

      toggleTheme: () =>
        set((state) => ({
          appearance: {
            ...state.appearance,
            theme:
              state.appearance.theme === "Light"
                ? "Dark"
                : "Light",
          },
        })),
              // ==========================
      // Emergency Contacts
      // ==========================

      addEmergencyContact: (contact) =>
        set((state) => ({
          emergencyContacts: [
            {
              id:
                crypto.randomUUID(),
              ...contact,
            },
            ...state.emergencyContacts,
          ],
        })),

      updateEmergencyContact: (
        id,
        updatedData
      ) =>
        set((state) => ({
          emergencyContacts:
            state.emergencyContacts.map(
              (contact) =>
                contact.id === id
                  ? {
                      ...contact,
                      ...updatedData,
                    }
                  : contact
            ),
        })),

      deleteEmergencyContact: (
        id
      ) =>
        set((state) => ({
          emergencyContacts:
            state.emergencyContacts.filter(
              (contact) =>
                contact.id !== id
            ),
        })),

      getEmergencyContactById: (
        id
      ) =>
        get().emergencyContacts.find(
          (contact) =>
            contact.id === id
        ),
              // ==========================
      // Support Tickets
      // ==========================

      addSupportTicket: (ticket) =>
        set((state) => ({
          supportTickets: [
            {
              id: crypto.randomUUID(),
              status: "Open",
              priority:
                ticket.priority || "Medium",
              createdAt:
                new Date().toISOString(),
              updatedAt:
                new Date().toISOString(),
              ...ticket,
            },
            ...state.supportTickets,
          ],
        })),

      updateSupportTicket: (
        id,
        updatedData
      ) =>
        set((state) => ({
          supportTickets:
            state.supportTickets.map(
              (ticket) =>
                ticket.id === id
                  ? {
                      ...ticket,
                      ...updatedData,
                      updatedAt:
                        new Date().toISOString(),
                    }
                  : ticket
            ),
        })),

      closeSupportTicket: (id) =>
        set((state) => ({
          supportTickets:
            state.supportTickets.map(
              (ticket) =>
                ticket.id === id
                  ? {
                      ...ticket,
                      status: "Closed",
                      updatedAt:
                        new Date().toISOString(),
                    }
                  : ticket
            ),
        })),

      deleteSupportTicket: (id) =>
        set((state) => ({
          supportTickets:
            state.supportTickets.filter(
              (ticket) =>
                ticket.id !== id
            ),
        })),

      getSupportTicketById: (
        id
      ) =>
        get().supportTickets.find(
          (ticket) =>
            ticket.id === id
        ),

      getSupportStats: () => {
        const tickets =
          get().supportTickets;

        return {
          total: tickets.length,
          open: tickets.filter(
            (ticket) =>
              ticket.status === "Open"
          ).length,
          closed: tickets.filter(
            (ticket) =>
              ticket.status === "Closed"
          ).length,
        };
      },
            // ==========================
      // Backup & Utilities
      // ==========================

      exportData: () => {
        console.log("Export Data");
        return true;
      },

      importData: () => {
        console.log("Import Data");
        return true;
      },

      createBackup: () => {
        console.log("Create Backup");
        return true;
      },

      restoreBackup: () => {
        console.log("Restore Backup");
        return true;
      },

      downloadReports: () => {
        console.log("Download Reports");
        return true;
      },

      // ==========================
      // Save Settings
      // ==========================

      saveSettings: async () => {
        const settings = get();

        console.log("Saving Settings...");

        console.log({
          profile: settings.profile,
          society: settings.society,
          notifications:
            settings.notifications,
          security: settings.security,
          appearance:
            settings.appearance,
          emergencyContacts:
            settings.emergencyContacts,
          supportTickets:
            settings.supportTickets,
        });

        return true;
      },

      // ==========================
      // Reset
      // ==========================

      resetSettings: () =>
        set({
          profile: defaultProfile,
          society: defaultSociety,
          notifications:
            defaultNotifications,
          security: defaultSecurity,
          appearance:
            defaultAppearance,
          emergencyContacts:
            defaultEmergencyContacts,
          supportTickets:
            defaultSupportTickets,
        }),
    }),
    {
      name: "settings-storage",

      partialize: (state) => ({
        profile: state.profile,
        society: state.society,
        notifications:
          state.notifications,
        appearance:
          state.appearance,
        emergencyContacts:
          state.emergencyContacts,
        supportTickets:
          state.supportTickets,
        security: {
          ...state.security,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        },
      }),
    }
  )
);

export default useSettingsStore;