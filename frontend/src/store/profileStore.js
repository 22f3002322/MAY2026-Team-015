import { create } from "zustand";
import useAuthStore from "./authStore";
import { authApi } from "../api/authApi";
import profileApi from "../api/profileApi";
import { mediaUrl } from "../utils/mediaUrl";

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
    avatar: mediaUrl(user.avatar) || mediaUrl(resProfile.profile_image) || null,
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
      try {
        const payload = {
          phone: data.phone || undefined,
          occupation: data.occupancy || data.occupation || undefined,
        };
        const res = await profileApi.updateMyProfile(payload);
        if (res && res.success) {
          await useAuthStore.getState().restoreSession();
          return { success: true };
        }
        return { success: false, message: res?.message };
      } catch (err) {
        console.error("Profile update failed:", err);
        return { success: false, message: err.message };
      }
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
      try {
        const payload = {
          emergency_contact: JSON.stringify(contact),
        };
        const res = await profileApi.updateMyProfile(payload);
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
      try {
        const res = await authApi.changePassword(currentPassword, newPassword);
        if (res && res.success) {
          return { success: true, message: res.message || "Password changed successfully." };
        }
        return {
          success: false,
          message: res?.message || "Failed to change password.",
        };
      } catch (err) {
        return {
          success: false,
          message: err.message || "Current password is incorrect.",
        };
      }
    },
  };
});

export default useProfileStore;