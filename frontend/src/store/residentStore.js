import { occupancyToApi, occupancyToUi } from "../utils/adminMaps";
import apartmentApi from "../api/apartmentApi";
import authApi from "../api/authApi";
import useAuthStore from "./authStore";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const mapBackendToResident = (profile) => {
  if (!profile) return null;
  return {
    id: profile.resident_id,
    residentId: profile.resident_id,
    user_id: profile.user_id,
    name: profile.full_name || "",
    email: profile.email || "",
    phone: profile.phone || "",
    flat: profile.flat_number || "",
    flat_id: profile.flat_id,
    block: profile.block_name || "",
    occupancy: occupancyToUi(profile.occupancy_type) || "",
    occupation: profile.occupation || "",
    emergency_contact: profile.emergency_contact || "",
    alternate_phone: profile.alternate_phone || "",
    status: profile.is_verified ? "Active" : "Inactive",
    joined: "",
  };
};

const useResidentStore = create(
  persist(
    (set, get) => ({
      residents: [],
      loading: false,

      fetchResidents: async (params = {}) => {
        set({ loading: true });
        try {
          const res = await apartmentApi.getResidents({
            current_only: true,
            ...params,
          });
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

      addResident: async (resident) => {
        try {
          const blocksRes = await apartmentApi.getBlocks();
          let blockId = resident.block_id ? Number(resident.block_id) : null;
          if (!blockId && blocksRes?.success && Array.isArray(blocksRes.data)) {
            const foundBlock = blocksRes.data.find(
              (b) =>
                String(b.block_name).toLowerCase() === String(resident.block || "").toLowerCase() ||
                String(b.block_id) === String(resident.block)
            );
            if (foundBlock) blockId = foundBlock.block_id;
          }

          let flatId = null;
          if (resident.flat) {
            const flatsRes = await apartmentApi.getFlats({
              block_id: blockId,
              flat_number: resident.flat,
            });
            if (flatsRes?.success && Array.isArray(flatsRes.data) && flatsRes.data.length > 0) {
              flatId = flatsRes.data[0].flat_id;
            }
          }
          if (!flatId) {
            return { success: false, message: "Could not resolve flat. Check block and flat number." };
          }

          const signupPayload = {
            email: resident.email,
            password: resident.password || "Demo@1234",
            full_name: resident.name,
            phone: resident.phone || null,
            role: "Resident",
            resident_profile: {
              flat_id: flatId,
              occupation: resident.occupation || "",
            },
          };

          const signupRes = await authApi.signup(signupPayload);
          if (!signupRes?.success || !signupRes.data) {
            return { success: false, message: signupRes?.message || "Failed to create account." };
          }

          const userId = signupRes.data.user_id;
          const callerRole = String(useAuthStore.getState().backendRole || "").toLowerCase();
          if (callerRole !== "committee") {
            return {
              success: false,
              message: "Only committee members can create and activate residents.",
            };
          }

          const occType = occupancyToApi(resident.occupancy) || "Owner";
          const verifyRes = await authApi.verifyUser(userId, { occupancy_type: occType });
          if (!verifyRes?.success) {
            return {
              success: false,
              message:
                verifyRes?.message ||
                "Account was created but activation failed. Find them under Pending Verifications.",
            };
          }

          await get().fetchResidents();
          return { success: true, message: "Resident created and activated." };
        } catch (err) {
          return { success: false, message: err.message || "Failed to add resident." };
        }
      },

      updateResident: async (id, updatedResident) => {
        try {
          const payload = {
            occupation: updatedResident.occupation || "",
            emergency_contact: updatedResident.emergency_contact || undefined,
            alternate_phone: updatedResident.alternate_phone || undefined,
          };
          const res = await apartmentApi.updateResident(id, payload);
          if (res?.success) {
            await get().fetchResidents();
            return { success: true, data: res.data };
          }
          return { success: false, message: res?.message || "Update failed." };
        } catch (err) {
          return { success: false, message: err.message || "Failed to update resident." };
        }
      },

      deleteResident: async (id) => {
        try {
          const res = await apartmentApi.moveOut(id);
          if (res?.success) {
            await get().fetchResidents();
            return { success: true, message: res.message || "Resident moved out." };
          }
          return { success: false, message: res?.message || "Failed to move out resident." };
        } catch (err) {
          return { success: false, message: err.message || "Failed to move out resident." };
        }
      },

      resetResidents: () => set({ residents: [] }),
    }),
    { name: "resident-storage" }
  )
);

export default useResidentStore;
