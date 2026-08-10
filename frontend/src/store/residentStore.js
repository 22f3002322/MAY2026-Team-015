import { create } from "zustand";
import { persist } from "zustand/middleware";
import apartmentApi from "../api/apartmentApi";
import authApi from "../api/authApi";

const mapBackendToResident = (profile) => {
  if (!profile) return null;
  return {
    id: profile.resident_id,
    residentId: profile.resident_id,
    user_id: profile.user_id,
    name: profile.full_name,
    email: profile.email,
    phone: profile.phone || "",
    flat: profile.flat_number || "",
    block: profile.block_name || "",
    occupancy: profile.occupation || "Resident",
    status: profile.is_verified ? "Active" : "Inactive",
    joined: new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
  };
};

const useResidentStore = create(
  persist(
    (set, get) => ({
      residents: [],
      loading: false,

      // Fetch all residents from backend API
      fetchResidents: async (params = {}) => {
        set({ loading: true });
        try {
          const res = await apartmentApi.getResidents(params);
          if (res && res.success && Array.isArray(res.data)) {
            const mapped = res.data.map(mapBackendToResident);
            set({ residents: mapped, loading: false });
            return { success: true, data: mapped };
          }
        } catch (err) {
          console.warn("Backend residents directory fetch failed:", err.message);
        }
        set({ loading: false });
        return { success: false, data: get().residents };
      },

      // Add (sign up via public auth route + auto-verify/move-in)
      addResident: async (resident) => {
        try {
          // 1. Fetch blocks to find block_id
          const blocksRes = await apartmentApi.getBlocks();
          let blockId = null;
          if (blocksRes && blocksRes.success && Array.isArray(blocksRes.data)) {
            const foundBlock = blocksRes.data.find(
              (b) => String(b.block_name).toLowerCase() === String(resident.block || "").toLowerCase()
            );
            if (foundBlock) blockId = foundBlock.block_id;
          }

          // 2. Fetch flats to resolve flat_number + block_id to flat_id
          let flatId = null;
          if (resident.flat) {
            const flatsRes = await apartmentApi.getFlats({
              block_id: blockId,
              flat_number: resident.flat,
            });
            if (flatsRes && flatsRes.success && Array.isArray(flatsRes.data) && flatsRes.data.length > 0) {
              flatId = flatsRes.data[0].flat_id;
            }
          }

          // 3. Signup user
          const signupPayload = {
            email: resident.email,
            password: resident.password || "password123",
            full_name: resident.name,
            phone: resident.phone || null,
            role: "Resident",
            resident_profile: {
              flat_id: flatId,
              occupation: resident.occupation || "",
            },
          };

          const signupRes = await authApi.signup(signupPayload);
          if (signupRes && signupRes.success && signupRes.data) {
            const userId = signupRes.data.user_id;

            // 4. Verify account if status is Active (only Committee members can verify users)
            const callerRole = String(useAuthStore.getState().backendRole || "").toLowerCase();
            if (resident.status === "Active" && callerRole === "committee") {
              await authApi.verifyUser(userId);
            }

            get().fetchResidents();
            return { success: true, message: "Resident created successfully." };
          }
          return { success: false, message: signupRes?.message || "Failed to create account." };
        } catch (err) {
          return { success: false, message: err.message || "Failed to add resident." };
        }
      },

      // Update emergency_contact / alternate_phone / occupation
      updateResident: async (id, updatedResident) => {
        try {
          const payload = {
            occupation: updatedResident.occupancy || updatedResident.occupation || "",
            emergency_contact: updatedResident.emergency_contact || "N/A",
            alternate_phone: updatedResident.alternate_phone || "",
          };
          const res = await apartmentApi.updateResident(id, payload);
          if (res && res.success) {
            get().fetchResidents();
            return { success: true, data: res.data };
          }
          return { success: false, message: res?.message || "Update failed." };
        } catch (err) {
          return { success: false, message: err.message || "Failed to update resident." };
        }
      },

      // Delete (moves resident out)
      deleteResident: async (id) => {
        try {
          const res = await apartmentApi.moveOut(id);
          if (res && res.success) {
            get().fetchResidents();
            return { success: true };
          }
          return { success: false, message: res?.message || "Failed to move out resident." };
        } catch (err) {
          return { success: false, message: err.message || "Failed to move out resident." };
        }
      },

      resetResidents: () => set({ residents: [] }),
    }),
    {
      name: "resident-storage",
    }
  )
);

export default useResidentStore;