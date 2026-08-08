import { create } from "zustand";
import { persist } from "zustand/middleware";
import { profileApi } from "../api/profileApi";

const initialProfile = {
  id: crypto.randomUUID(),
  name: "William Alexander",
  email: "william@example.com",
  phone: "+91 9876543210",
  block: "A",
  flat: "203",
  occupancy: "Owner",
  joined: "12 Jan 2025",
  avatar: "https://i.pravatar.cc/300?img=12",
  familyDetails: [
    {
      id: crypto.randomUUID(),
      name: "Emma Alexander",
      relation: "Wife",
      age: 30,
    },
    {
      id: crypto.randomUUID(),
      name: "Sophia Alexander",
      relation: "Daughter",
      age: 6,
    },
  ],
  vehicleDetails: [
    {
      id: crypto.randomUUID(),
      type: "Car",
      number: "UP32 AB 1234",
    },
    {
      id: crypto.randomUUID(),
      type: "Bike",
      number: "UP32 XY 5678",
    },
  ],
  emergencyContact: {
    name: "Emma Alexander",
    relation: "Wife",
    phone: "+91 9988776655",
  },
  createdAt: new Date().toISOString(),
  updatedAt: null,
};

const useProfileStore = create(
  persist(
    (set) => ({
      profile: initialProfile,

      updateProfile: (data) =>
        set((state) => ({
          profile: {
            ...state.profile,
            ...data,
            updatedAt: new Date().toISOString(),
          },
        })),

      uploadAvatar: async (file) => {
        try {
          const res = await profileApi.uploadProfilePicture(file);
          if (res && res.success && res.data?.profile_image) {
            const imageUrl = res.data.profile_image;
            set((state) => ({
              profile: {
                ...state.profile,
                avatar: imageUrl,
                updatedAt: new Date().toISOString(),
              },
            }));
            return { success: true, avatar: imageUrl };
          }
        } catch (err) {
          console.warn("Backend avatar upload failed or server offline:", err.message);
        }

        // Local blob URL fallback for local offline testing
        const localUrl = URL.createObjectURL(file);
        set((state) => ({
          profile: {
            ...state.profile,
            avatar: localUrl,
            updatedAt: new Date().toISOString(),
          },
        }));
        return { success: true, avatar: localUrl };
      },

      removeAvatar: async () => {
        try {
          await profileApi.deleteProfilePicture();
        } catch (err) {
          console.warn("Backend avatar delete failed:", err.message);
        }

        set((state) => ({
          profile: {
            ...state.profile,
            avatar: "https://i.pravatar.cc/300?img=12",
            updatedAt: new Date().toISOString(),
          },
        }));
      },

      updateEmergencyContact: (contact) =>
        set((state) => ({
          profile: {
            ...state.profile,
            emergencyContact: contact,
            updatedAt: new Date().toISOString(),
          },
        })),

      addVehicle: (vehicle) =>
        set((state) => ({
          profile: {
            ...state.profile,
            vehicleDetails: [
              ...state.profile.vehicleDetails,
              {
                id: crypto.randomUUID(),
                ...vehicle,
              },
            ],
            updatedAt: new Date().toISOString(),
          },
        })),

      removeVehicle: (id) =>
        set((state) => ({
          profile: {
            ...state.profile,
            vehicleDetails: state.profile.vehicleDetails.filter(
              (vehicle) => vehicle.id !== id
            ),
            updatedAt: new Date().toISOString(),
          },
        })),

      addFamilyMember: (member) =>
        set((state) => ({
          profile: {
            ...state.profile,
            familyDetails: [
              ...state.profile.familyDetails,
              {
                id: crypto.randomUUID(),
                ...member,
              },
            ],
            updatedAt: new Date().toISOString(),
          },
        })),

      removeFamilyMember: (id) =>
        set((state) => ({
          profile: {
            ...state.profile,
            familyDetails: state.profile.familyDetails.filter(
              (member) => member.id !== id
            ),
            updatedAt: new Date().toISOString(),
          },
        })),

      changePassword: async (currentPassword, newPassword) => {
        console.log({ currentPassword, newPassword });
        return true;
      },

      resetProfile: () =>
        set({
          profile: {
            ...initialProfile,
            familyDetails: [...initialProfile.familyDetails],
            vehicleDetails: [...initialProfile.vehicleDetails],
            emergencyContact: { ...initialProfile.emergencyContact },
          },
        }),
    }),
    {
      name: "profile-storage",
    }
  )
);

export default useProfileStore;