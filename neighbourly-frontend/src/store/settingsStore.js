import { create } from "zustand";

const useSettingsStore = create((set, get) => ({
  // ==========================
  // Profile
  // ==========================
  profile: {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+91 9876543210",
    designation: "Committee Admin",
    avatar: null,
  },

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
  society: {
    societyName: "Green Valley Residency",
    registrationNo: "GVR-2022-001",
    address:
      "123 Green Valley Road, Bengaluru, Karnataka",
    contactEmail: "info@greenvalley.com",
    contactPhone: "+91 9876543210",
  },

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
  notifications: {
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    complaintAlerts: true,
    visitorAlerts: true,
    billingAlerts: false,
  },

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

  // ==========================
  // Security
  // ==========================
  security: {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactor: false,
    autoLogout: true,
    sessionTimeout: "30",
  },

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

  // ==========================
  // Appearance
  // ==========================
  appearance: {
    theme: "Light",
    primaryColor: "Indigo",
    sidebar: "Expanded",
    density: "Comfortable",
  },

  updateAppearance: (data) =>
    set((state) => ({
      appearance: {
        ...state.appearance,
        ...data,
      },
    })),

  // ==========================
  // Backup
  // ==========================
  exportData: () => {
    alert("Exporting society data...");
    console.log("Export Data");
  },

  importData: () => {
    alert(
      "Import functionality will be connected to backend."
    );
    console.log("Import Data");
  },

  createBackup: () => {
    alert("Backup created successfully.");
    console.log("Create Backup");
  },

  restoreBackup: () => {
    alert(
      "Restore functionality will be connected to backend."
    );
    console.log("Restore Backup");
  },

  downloadReports: () => {
    alert("Downloading reports...");
    console.log("Download Reports");
  },

  // ==========================
  // Save All Settings
  // ==========================
  saveSettings: async () => {
    const settings = get();

    console.log("Saving Settings...");

    console.log({
      profile: settings.profile,
      society: settings.society,
      notifications: settings.notifications,
      security: settings.security,
      appearance: settings.appearance,
    });

    // Replace with API call
    // await axios.put("/settings", {
    //   profile: settings.profile,
    //   society: settings.society,
    //   notifications: settings.notifications,
    //   security: settings.security,
    //   appearance: settings.appearance,
    // });

    alert("Settings saved successfully!");
  },

  // ==========================
  // Reset
  // ==========================
  resetSettings: () =>
    set((state) => ({
      profile: {
        ...state.profile,
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+91 9876543210",
        designation: "Committee Admin",
        avatar: null,
      },

      society: {
        societyName: "Green Valley Residency",
        registrationNo: "GVR-2022-001",
        address:
          "123 Green Valley Road, Bengaluru, Karnataka",
        contactEmail: "info@greenvalley.com",
        contactPhone: "+91 9876543210",
      },

      notifications: {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        complaintAlerts: true,
        visitorAlerts: true,
        billingAlerts: false,
      },

      security: {
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        twoFactor: false,
        autoLogout: true,
        sessionTimeout: "30",
      },

      appearance: {
        theme: "Light",
        primaryColor: "Indigo",
        sidebar: "Expanded",
        density: "Comfortable",
      },
    })),
}));

export default useSettingsStore;