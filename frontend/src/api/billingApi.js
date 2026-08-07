import { apiRequest } from "./client";

// ── Module 8: Billing & Payments
export const billingApi = {
  // ── Admin/Committee bills management (/api/v1/admin/bills)
  getBills: async (flatId = null) => {
    const qs = flatId ? `?flat_id=${flatId}` : "";
    return apiRequest(`/api/v1/admin/bills${qs}`, { method: "GET" });
  },

  getBill: async (billId) => {
    return apiRequest(`/api/v1/admin/bills/${billId}`, { method: "GET" });
  },

  createBill: async (payload) => {
    // payload: { flat_id, bill_type, amount?, due_date, items?: [{description, amount}] }
    return apiRequest("/api/v1/admin/bills", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateBill: async (billId, payload) => {
    return apiRequest(`/api/v1/admin/bills/${billId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  getBillingSummary: async () => {
    return apiRequest("/api/v1/admin/bills/summary", { method: "GET" });
  },

  // ── Resident's own bills & payments (/api/v1/billing/me)
  getMyBills: async () => {
    return apiRequest("/api/v1/billing/me/bills", { method: "GET" });
  },

  getMyPayments: async () => {
    return apiRequest("/api/v1/billing/me/payments", { method: "GET" });
  },

  // ── Payments (/api/v1/payments)
  getPayments: async (billId = null) => {
    const qs = billId ? `?bill_id=${billId}` : "";
    return apiRequest(`/api/v1/payments${qs}`, { method: "GET" });
  },

  getPayment: async (paymentId) => {
    return apiRequest(`/api/v1/payments/${paymentId}`, { method: "GET" });
  },

  createPayment: async (payload) => {
    // payload: { bill_id, amount, payment_method, transaction_reference, status }
    return apiRequest("/api/v1/payments", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getReceipt: async (paymentId) => {
    return apiRequest(`/api/v1/payments/${paymentId}/receipt`, { method: "GET" });
  },
};

export default billingApi;
