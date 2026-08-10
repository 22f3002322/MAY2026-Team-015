import { create } from "zustand";
import useAuthStore from "./authStore";
import apartmentApi from "../api/apartmentApi";
import profileApi from "../api/profileApi";

const getProfileFromUser = (user) => {
  if (!user) {
    return {
      id: "",
      name: "",
      email: "",
      phone: "",
      block: "",
      flat: "",
      occupancy: "",
      joined: "",
      avatar: "",
      emergencyContact: { name: "", relation: "", phone: "" },
    };
  }

  const resProfile = user.residentProfile || {};
  let emergencyContact = { name: "", relation: "", phone: "" };
  if (resProfile.emergency_contact) {
    try {
      const parsed = JSON.parse(resProfile.emergency_contact);
      if (parsed && typeof parsed === "object") {
        emergencyContact = {
          name: parsed.name || "",
          relation: parsed.relation || "",
          phone: parsed.phone || "",
        };
      }
    } catch {
      emergencyContact = {
        name: resProfile.emergency_contact,
        relation: "Emergency",
        phone: "",
      };
    }
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    block: user.block || "",
    flat: user.flat || "",
    occupancy: resProfile.occupation || "Resident",
    joined: resProfile.move_in_date
      ? new Date(resProfile.move_in_date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "Recently",
    avatar: user.avatar || "https://i.pravatar.cc/300?img=12",
    emergencyContact,
  };
};

const useProfileStore = create((set, get) => {
  // Listen to authStore changes and keep profile synced
  useAuthStore.subscribe((state) => {
    set({ profile: getProfileFromUser(state.user) });
  });

  return {
    profile: getProfileFromUser(useAuthStore.getState().user),

    updateProfile: async (data) => {
      const user = useAuthStore.getState().user;
      const resProfile = user?.residentProfile || {};
      if (!resProfile.resident_id) return { success: false };

      try {
        const payload = {
          occupation: data.occupancy || data.occupation || resProfile.occupation || "",
          emergency_contact: resProfile.emergency_contact || "",
          alternate_phone: data.phone || resProfile.alternate_phone || "",
        };
        const res = await apartmentApi.updateResident(resProfile.resident_id, payload);
        if (res && res.success) {
          await useAuthStore.getState().restoreSession();
          return { success: true };
        }
      } catch (err) {
        console.error("Profile update failed:", err);
      }
      return { success: false };
    },

    uploadAvatar: async (file) => {
      try {
        const res = await profileApi.uploadProfilePicture(file);
        if (res && res.success) {
          await useAuthStore.getState().restoreSession();
          return { success: true };
        }
      } catch (err) {
        console.error("Avatar upload failed:", err);
      }
      return { success: false };
    },

    removeAvatar: async () => {
      try {
        const res = await profileApi.deleteProfilePicture();
        if (res && res.success) {
          await useAuthStore.getState().restoreSession();
          return { success: true };
        }
      } catch (err) {
        console.error("Avatar removal failed:", err);
      }
      return { success: false };
    },

    updateEmergencyContact: async (contact) => {
      const user = useAuthStore.getState().user;
      const resProfile = user?.residentProfile || {};
      if (!resProfile.resident_id) return { success: false };

      try {
        const payload = {
          occupation: resProfile.occupation || "",
          emergency_contact: JSON.stringify(contact),
          alternate_phone: resProfile.alternate_phone || "",
        };
        const res = await apartmentApi.updateResident(resProfile.resident_id, payload);
        if (res && res.success) {
          await useAuthStore.getState().restoreSession();
          return { success: true };
        }
      } catch (err) {
        console.error("Emergency contact update failed:", err);
      }
      return { success: false };
    },

    changePassword: async (currentPassword, newPassword) => {
      return true;
    },
  };
});

export default useProfileStore;