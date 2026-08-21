import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "../api/authApi";
import { mediaUrl } from "../utils/mediaUrl";
import useAiStore from "./aiStore";

export const mapBackendRoleToFrontend = (backendRole) => {
  if (!backendRole) return "resident";

  const r = String(backendRole).toLowerCase();

  if (r === "admin" || r === "committee") return "admin";
  if (r === "resident") return "resident";
  if (r === "maintenance" || r === "security" || r === "staff") return "staff";

  return "resident";
};

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      role: null,
      backendRole: null,   // raw backend role: "Admin" | "Committee" | "Resident" | etc.
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      isVerified: false,
      pendingVerifications: [],

      // Backend-only login
      login: async (email, password) => {
        try {
          const res = await authApi.login(email, password);

          if (!res || !res.success || !res.data) {
            return {
              success: false,
              message: res?.message || "Invalid email or password",
            };
          }

          const {
            access_token,
            refresh_token,
            role: rawBackendRole,
            is_verified,
          } = res.data;

          const frontendRole = mapBackendRoleToFrontend(rawBackendRole);

          set({
            accessToken: access_token,
            refreshToken: refresh_token,
            role: frontendRole,
            backendRole: rawBackendRole,
            isAuthenticated: true,
            isVerified: is_verified === true,
          });

          // Fetch complete user profile
          try {
            const meRes = await authApi.getMe();

            if (meRes && meRes.success && meRes.data) {
              const me = meRes.data;
              const residentInfo = me.resident_profile || {};

              set({
                user: {
                  id: me.user_id,
                  name: me.full_name,
                  email: me.email,
                  phone: me.phone,
                  flat: residentInfo.flat_number || null,
                  flatId: residentInfo.flat_id ?? null,
                  block: residentInfo.block_name || null,
                  occupancy: "Resident",
                  isVerified: me.is_verified,
                  staffRole: me.maintenance_profile || String(me.role || rawBackendRole || "").toLowerCase() === "maintenance"
                    ? "maintenance"
                    : me.security_profile || String(me.role || rawBackendRole || "").toLowerCase() === "security"
                    ? "security"
                    : null,
                  residentProfile: residentInfo,
                  avatar: mediaUrl(residentInfo.profile_image),
                },
              });
            }
          } catch (meErr) {
            console.warn(
              "Could not fetch user profile:",
              meErr.message
            );

            set({
              user: {
                email,
                name: email.split("@")[0],
              },
            });
          }

          return {
            success: true,
            role: frontendRole,
            isVerified: is_verified === true,
          };

        } catch (err) {
          console.error("Backend login failed:", err);

          return {
            success: false,
            message:
              err?.response?.data?.message ||
              "Invalid email or password",
          };
        }
      },


      // Signup
      signup: async (signupData) => {
        try {
          const res = await authApi.signup(signupData);

          if (res && res.success) {
            return {
              success: true,
              message:
                res.message ||
                "Registration successful! Await verification.",
            };
          }

          return {
            success: false,
            message: res?.message || "Registration failed",
          };

        } catch (err) {
          return {
            success: false,
            message:
              err?.response?.data?.message ||
              "Registration failed",
          };
        }
      },


      // Forgot password
      forgotPassword: async (email) => {
        try {
          const res = await authApi.forgotPassword(email);

          return {
            success: true,
            message:
              res?.message ||
              "If the email exists, reset instructions were sent.",
          };

        } catch (err) {
          return {
            success: false,
            message:
              err?.response?.data?.message ||
              "Failed to process request",
          };
        }
      },


      // Reset password
      resetPassword: async (token, newPassword) => {
        try {
          const res = await authApi.resetPassword(
            token,
            newPassword
          );

          return {
            success: true,
            message:
              res?.message ||
              "Password reset successfully.",
          };

        } catch (err) {
          return {
            success: false,
            message:
              err?.response?.data?.message ||
              "Failed to reset password",
          };
        }
      },


      // Restore backend session
      restoreSession: async () => {
        const { accessToken } = get();

        if (!accessToken) return;

        try {
          const res = await authApi.getMe();

          if (res && res.success && res.data) {
            const me = res.data;
            const residentInfo = me.resident_profile || {};

            set({
              user: {
                id: me.user_id,
                name: me.full_name,
                email: me.email,
                phone: me.phone,
                flat: residentInfo.flat_number || null,
                flatId: residentInfo.flat_id ?? null,
                block: residentInfo.block_name || null,
                occupancy: "Resident",
                isVerified: me.is_verified,
                staffRole: me.maintenance_profile || String(me.role || "").toLowerCase() === "maintenance"
                  ? "maintenance"
                  : me.security_profile || String(me.role || "").toLowerCase() === "security"
                  ? "security"
                  : null,
                residentProfile: residentInfo,
                avatar: mediaUrl(residentInfo.profile_image),
              },
              role: mapBackendRoleToFrontend(me.role),
              backendRole: me.role,
              isAuthenticated: true,
              isVerified: me.is_verified === true,
            });
          }

        } catch (err) {
          console.warn(
            "Session restore failed:",
            err.message
          );
        }
      },


      // Pending verification list — only callable by committee (backend enforces this)
      fetchPendingVerifications: async () => {
        const { backendRole } = get();
        const role = String(backendRole || "").toLowerCase();

        if (role !== "committee") {
          return { success: false, data: [], message: "Not allowed." };
        }

        try {
          const res = await authApi.getPendingVerifications();

          if (res && res.success) {
            set({ pendingVerifications: res.data || [] });
            return { success: true, data: res.data || [] };
          }

          set({ pendingVerifications: [] });
          return {
            success: false,
            data: [],
            message: res?.message || "Failed to load pending verifications.",
          };
        } catch (err) {
          console.warn("Fetch verification failed:", err.message);
          set({ pendingVerifications: [] });
          return {
            success: false,
            data: [],
            message: err.message || "Failed to load pending verifications.",
          };
        }
      },


      // Verify user (Committee). Optional occupancy_type + flat_id.
      verifyUserAccount: async (userId, options = {}) => {
        try {
          const payload = {};
          // Back-compat: second arg used to be occupancyType string
          if (typeof options === "string") {
            if (options) payload.occupancy_type = options;
          } else if (options && typeof options === "object") {
            if (options.occupancyType || options.occupancy_type) {
              payload.occupancy_type =
                options.occupancyType || options.occupancy_type;
            }
            if (options.flatId != null || options.flat_id != null) {
              payload.flat_id = Number(options.flatId ?? options.flat_id);
            }
          }

          const res = await authApi.verifyUser(userId, payload);

          if (res && res.success) {
            set((state) => ({
              pendingVerifications: state.pendingVerifications.filter(
                (u) => u.user_id !== userId
              ),
            }));

            return {
              success: true,
              message: res.message || "User verified successfully",
            };
          }

          return {
            success: false,
            message: res?.message || "Failed to verify user",
          };
        } catch (err) {
          return {
            success: false,
            message:
              err?.message ||
              err?.response?.data?.message ||
              "Failed to verify user",
          };
        }
      },


      // Admin registers committee member
      registerCommitteeMember: async (payload) => {
        try {
          const res = await authApi.registerCommittee(payload);
          if (res && res.success) {
            return {
              success: true,
              data: res.data,
              message: res.message || "Committee member registered successfully.",
            };
          }
          return {
            success: false,
            message: res?.message || "Registration failed.",
          };
        } catch (err) {
          return {
            success: false,
            message: err?.message || "Failed to register committee member.",
          };
        }
      },

      // Logout
      logout: async () => {
        const { refreshToken } = get();

        if (refreshToken) {
          try {
            await authApi.logout(refreshToken);
          } catch (err) {
            console.warn(
              "Backend logout failed:",
              err.message
            );
          }
        }

        set({
          user: null,
          role: null,
          backendRole: null,
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
          isVerified: false,
          pendingVerifications: [],
        });

        useAiStore.getState().reset();
      },
    }),

    {
      name: "auth-storage",
    }
  )
);

export default useAuthStore;