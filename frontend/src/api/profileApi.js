import { apiRequest } from "./client";

export const profileApi = {
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
