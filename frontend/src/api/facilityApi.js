import { apiRequest } from "./client";

export const facilityApi = {
  // Admin / Committee facilities list
  getFacilities: async () => {
    return apiRequest("/api/v1/facilities", {
      method: "GET",
    });
  },

  // Create facility (Committee / Admin)
  createFacility: async (payload) => {
    return apiRequest("/api/v1/admin/facilities", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Get facility details
  getFacility: async (id) => {
    return apiRequest(`/api/v1/admin/facilities/${id}`, {
      method: "GET",
    });
  },

  // Update facility
  updateFacility: async (id, payload) => {
    return apiRequest(`/api/v1/admin/facilities/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  // List bookings (Resident gets own, Admin/Committee gets all)
  getBookings: async () => {
    return apiRequest("/api/v1/facility-bookings", {
      method: "GET",
    });
  },

  // Create facility booking (Resident)
  createBooking: async (payload) => {
    return apiRequest("/api/v1/facility-bookings", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Get booking details
  getBooking: async (id) => {
    return apiRequest(`/api/v1/facility-bookings/${id}`, {
      method: "GET",
    });
  },

  // Update booking status (Committee / Admin)
  updateBooking: async (id, payload) => {
    return apiRequest(`/api/v1/facility-bookings/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
};

export default facilityApi;
