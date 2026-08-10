import { apiRequest } from "./client";

export const authApi = {
  // Public self-registration (Resident / Maintenance / Security)
  signup: async (payload) => {
    return apiRequest("/api/v1/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Login
  login: async (email, password) => {
    return apiRequest("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  // Refresh token
  refresh: async (refreshToken) => {
    return apiRequest("/api/v1/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  },

  // Logout
  logout: async (refreshToken) => {
    return apiRequest("/api/v1/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  },

  // Get current logged in user details
  getMe: async () => {
    return apiRequest("/api/v1/auth/me", {
      method: "GET",
    });
  },

  // Forgot password
  forgotPassword: async (email) => {
    return apiRequest("/api/v1/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    return apiRequest("/api/v1/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, new_password: newPassword }),
    });
  },

  // Admin registers committee member
  registerCommittee: async (payload) => {
    return apiRequest("/api/v1/auth/register-committee", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Committee views pending verifications
  getPendingVerifications: async () => {
    return apiRequest("/api/v1/auth/pending-verifications", {
      method: "GET",
    });
  },

  // Committee verifies a pending user account
  verifyUser: async (userId) => {
    return apiRequest(`/api/v1/auth/verify/${userId}`, {
      method: "POST",
    });
  },

  // List all users (Admin and Committee)
  listUsers: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.role) params.set("role", filters.role);
    if (filters.is_verified !== undefined) params.set("is_verified", String(filters.is_verified));
    if (filters.is_active !== undefined) params.set("is_active", String(filters.is_active));
    if (filters.search) params.set("search", filters.search);
    const qs = params.toString();
    return apiRequest(`/api/v1/users${qs ? `?${qs}` : ""}`, {
      method: "GET",
    });
  },

  // Deactivate a user
  deactivateUser: async (userId) => {
    return apiRequest(`/api/v1/users/${userId}/deactivate`, {
      method: "POST",
    });
  },

  // Reactivate a user
  reactivateUser: async (userId) => {
    return apiRequest(`/api/v1/users/${userId}/reactivate`, {
      method: "POST",
    });
  },

  // Health check
  checkHealth: async () => {
    return apiRequest("/health", {
      method: "GET",
    });
  },
};

export default authApi;
