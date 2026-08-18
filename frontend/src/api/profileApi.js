import { apiRequest } from "./client";

export const profileApi = {
  // Resident self-service profile update (phone + contact fields)
  updateMyProfile: async (payload) => {
    return apiRequest("/api/v1/residents/me", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  // Upload resident profile picture
  uploadProfilePicture: async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    return apiRequest("/api/v1/residents/me/profile-picture", {
      method: "POST",
      body: formData,
    });
  },

  // Delete resident profile picture
  deleteProfilePicture: async () => {
    return apiRequest("/api/v1/residents/me/profile-picture", {
      method: "DELETE",
    });
  },
};

export default profileApi;
