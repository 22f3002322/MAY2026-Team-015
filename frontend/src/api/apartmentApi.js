import { apiRequest } from "./client";

export const apartmentApi = {
  // ─── Blocks ─────────────────────────────────────────────────────────────
  getBlocks: async () => {
    return apiRequest("/api/v1/blocks", { method: "GET" });
  },

  getBlock: async (blockId) => {
    return apiRequest(`/api/v1/blocks/${blockId}`, { method: "GET" });
  },

  createBlock: async (payload) => {
    return apiRequest("/api/v1/blocks", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateBlock: async (blockId, payload) => {
    return apiRequest(`/api/v1/blocks/${blockId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  deleteBlock: async (blockId) => {
    return apiRequest(`/api/v1/blocks/${blockId}`, { method: "DELETE" });
  },

  // ─── Flats ───────────────────────────────────────────────────────────────
  getFlats: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.block_id)        query.append("block_id", params.block_id);
    if (params.occupancy_status) query.append("occupancy_status", params.occupancy_status);
    if (params.flat_number)     query.append("flat_number", params.flat_number);
    const qs = query.toString() ? `?${query.toString()}` : "";
    return apiRequest(`/api/v1/flats${qs}`, { method: "GET" });
  },

  getFlatDetails: async (flatId) => {
    return apiRequest(`/api/v1/flats/${flatId}`, { method: "GET" });
  },

  createFlat: async (payload) => {
    return apiRequest("/api/v1/flats", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateFlat: async (flatId, payload) => {
    return apiRequest(`/api/v1/flats/${flatId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  deleteFlat: async (flatId) => {
    return apiRequest(`/api/v1/flats/${flatId}`, { method: "DELETE" });
  },

  // ─── Residents directory (Admin / Committee) ─────────────────────────────
  // GET /api/v1/residents — list all residents with optional filters
  getResidents: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.block_id) query.append("block_id", params.block_id);
    if (params.flat_id)  query.append("flat_id",  params.flat_id);
    if (params.current_only === false) query.append("current_only", "false");
    if (params.current_only === true) query.append("current_only", "true");
    const qs = query.toString() ? `?${query.toString()}` : "";
    return apiRequest(`/api/v1/residents${qs}`, { method: "GET" });
  },

  // GET /api/v1/residents/{resident_id} — single resident full profile
  getResident: async (residentId) => {
    return apiRequest(`/api/v1/residents/${residentId}`, { method: "GET" });
  },

  // PATCH /api/v1/residents/{resident_id} — edit emergency_contact / alternate_phone / occupation
  updateResident: async (residentId, payload) => {
    return apiRequest(`/api/v1/residents/${residentId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  // POST /api/v1/residents/{resident_id}/move-in
  moveIn: async (residentId, payload) => {
    // payload: { flat_id, occupancy_type?, move_in_date? }
    return apiRequest(`/api/v1/residents/${residentId}/move-in`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // POST /api/v1/residents/{resident_id}/move-out
  moveOut: async (residentId, payload = {}) => {
    // payload: { move_out_date? }
    return apiRequest(`/api/v1/residents/${residentId}/move-out`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // GET /api/v1/residents/{resident_id}/occupancy-history
  getOccupancyHistory: async (residentId) => {
    return apiRequest(`/api/v1/residents/${residentId}/occupancy-history`, {
      method: "GET",
    });
  },
};

export default apartmentApi;
