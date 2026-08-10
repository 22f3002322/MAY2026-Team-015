import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "../api/authApi";

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
      isVerified: true,
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
            isVerified: is_verified !== false,
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
                  flat: residentInfo.flat_id
                    ? String(residentInfo.flat_id)
                    : null,
                  block: residentInfo.block || null,
                  occupancy: "Resident",
                  isVerified: me.is_verified,
                  staffRole: me.maintenance_profile
                    ? "maintenance"
                    : me.security_profile
                    ? "security"
                    : null,
                  residentProfile: residentInfo,
                  avatar: me.profile_image || null,
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
            isVerified: is_verified !== false,
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
                flat: residentInfo.flat_id
                  ? String(residentInfo.flat_id)
                  : null,
                block: residentInfo.block || null,
                occupancy: "Resident",
                isVerified: me.is_verified,
                staffRole: me.maintenance_profile
                  ? "maintenance"
                  : me.security_profile
                  ? "security"
                  : null,
                residentProfile: residentInfo,
                avatar: me.profile_image || null,
              },
              role: mapBackendRoleToFrontend(me.role),
              backendRole: me.role,
              isAuthenticated: true,
              isVerified: me.is_verified !== false,
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

        // Admin cannot call this endpoint — backend returns 403.
        // Only committee members are allowed.
        if (role !== "committee") {
          return { success: false, data: [] };
        }

        try {
          const res = await authApi.getPendingVerifications();

          if (res && res.success) {
            set({
              pendingVerifications: res.data || [],
            });

            return {
              success: true,
              data: res.data,
            };
          }

        } catch (err) {
          console.warn(
            "Fetch verification failed:",
            err.message
          );
        }

        return {
          success: false,
          data: [],
        };
      },


      // Verify user
      verifyUserAccount: async (userId) => {
        try {
          const res = await authApi.verifyUser(userId);

          if (res && res.success) {
            set((state) => ({
              pendingVerifications:
                state.pendingVerifications.filter(
                  (u) => u.user_id !== userId
                ),
            }));

            return {
              success: true,
              message:
                res.message ||
                "User verified successfully",
            };
          }

        } catch (err) {
          return {
            success: false,
            message:
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
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
          pendingVerifications: [],
        });
      },
    }),

    {
      name: "auth-storage",
    }
  )
);

export default useAuthStore;