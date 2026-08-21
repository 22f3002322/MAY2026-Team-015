import { create } from "zustand";
import useAuthStore from "./authStore";
import { authApi } from "../api/authApi";
import profileApi from "../api/profileApi";
import { mediaUrl } from "../utils/mediaUrl";

const parseEmergencyContact = (raw) => {
  if (!raw) return { name: "", relation: "", phone: "" };
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return {
        name: parsed.name || "",
        relation: parsed.relation || "",
        phone: parsed.phone || "",
      };
    }
  } catch {
    /* pipe-delimited single line */
  }
  const parts = String(raw).split("|").map((p) => p.trim());
  return {
    name: parts[0] || String(raw),
    relation: parts[1] || "",
    phone: parts[2] || "",
  };
};

const formatEmergencyContact = (contact) => {
  const name = (contact?.name || "").trim();
  const relation = (contact?.relation || "").trim();
  const phone = (contact?.phone || "").trim();
  return [name, relation, phone].filter(Boolean).join(" | ").slice(0, 200);
};

const getProfileFromUser = (user) => {
  if (!user) {
    return {
      id: "",
      name: "",
      email: "",
      phone: "",
      alternatePhone: "",
      block: "",
      flat: "",
      occupation: "",
      occupancy: "",
      joined: "",
      avatar: "",
      emergencyContact: { name: "", relation: "", phone: "" },
    };
  }

  const resProfile = user.residentProfile || {};

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    alternatePhone: resProfile.alternate_phone || "",
    block: user.block || resProfile.block_name || "",
    flat: user.flat || resProfile.flat_number || "",
    occupation: resProfile.occupation || "",
    occupancy: "Resident",
    joined: "—",
    avatar: mediaUrl(user.avatar) || mediaUrl(resProfile.profile_image) || null,
    emergencyContact: parseEmergencyContact(resProfile.emergency_contact),
  };
};

const useProfileStore = create((set, get) => {
  useAuthStore.subscribe((state) => {
    set({ profile: getProfileFromUser(state.user) });
  });

  return {
    profile: getProfileFromUser(useAuthStore.getState().user),

    updateProfile: async (data) => {
      try {
        const payload = {
          phone: data.phone || undefined,
          occupation: data.occupation || undefined,
          alternate_phone: data.alternatePhone || data.alternate_phone || undefined,
        };
        if (data.emergencyContact) {
          payload.emergency_contact = formatEmergencyContact(data.emergencyContact);
        }
        const res = await profileApi.updateMyProfile(payload);
        if (res && res.success) {
          await useAuthStore.getState().restoreSession();
          return { success: true, message: res.message };
        }
        return { success: false, message: res?.message || "Update failed." };
      } catch (err) {
        console.error("Profile update failed:", err);
        return { success: false, message: err.message || "Update failed." };
      }
    },

    uploadAvatar: async (file) => {
      try {
        const res = await profileApi.uploadProfilePicture(file);
        if (res && res.success) {
          await useAuthStore.getState().restoreSession();
          return { success: true, message: res.message };
        }
        return { success: false, message: res?.message || "Upload failed." };
      } catch (err) {
        console.error("Avatar upload failed:", err);
        return { success: false, message: err.message || "Upload failed." };
      }
    },

    removeAvatar: async () => {
      try {
        const res = await profileApi.deleteProfilePicture();
        if (res && res.success) {
          await useAuthStore.getState().restoreSession();
          return { success: true, message: res.message };
        }
        return { success: false, message: res?.message || "Remove failed." };
      } catch (err) {
        console.error("Avatar removal failed:", err);
        return { success: false, message: err.message || "Remove failed." };
      }
    },

    updateEmergencyContact: async (contact) => {
      try {
        const payload = {
          emergency_contact: formatEmergencyContact(contact),
        };
        const res = await profileApi.updateMyProfile(payload);
        if (res && res.success) {
          await useAuthStore.getState().restoreSession();
          return { success: true, message: res.message };
        }
        return { success: false, message: res?.message || "Update failed." };
      } catch (err) {
        console.error("Emergency contact update failed:", err);
        return { success: false, message: err.message || "Update failed." };
      }
    },

    changePassword: async (currentPassword, newPassword) => {
      try {
        const res = await authApi.changePassword(currentPassword, newPassword);
        if (res && res.success) {
          return {
            success: true,
            message: res.message || "Password changed successfully.",
          };
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
