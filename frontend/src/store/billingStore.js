import { create } from "zustand";
import { persist } from "zustand/middleware";
import billingApi from "../api/billingApi";

const useBillingStore = create(
  persist(
    (set, get) => ({
      bills: [],
      payments: [],
      summary: null,
      myBills: [],
      myPayments: [],
      loading: false,

      // ── Admin/Committee: bill management ─────────────────────────────────
      fetchBills: async (flatId = null) => {
        set({ loading: true });
        try {
          const res = await billingApi.getBills(flatId);
          if (res && res.success && Array.isArray(res.data)) {
            set({ bills: res.data, loading: false });
            return { success: true, data: res.data };
          }
        } catch (err) {
          console.warn("Bills fetch failed:", err.message);
        }
        set({ loading: false });
        return { success: false, data: get().bills };
      },

      fetchBillingSummary: async () => {
        try {
          const res = await billingApi.getBillingSummary();
          if (res && res.success && res.data) {
            set({ summary: res.data });
            return { success: true, data: res.data };
          }
        } catch (err) {
          console.warn("Billing summary fetch failed:", err.message);
        }
        return { success: false };
      },

      createBill: async (payload) => {
        try {
          const res = await billingApi.createBill(payload);
          if (res && res.success) {
            get().fetchBills();
            return { success: true, data: res.data, message: res.message };
          }
          return { success: false, message: res?.message || "Failed to create bill." };
        } catch (err) {
          return { success: false, message: err.message || "Failed to create bill." };
        }
      },

      updateBill: async (billId, payload) => {
        try {
          const res = await billingApi.updateBill(billId, payload);
          if (res && res.success) {
            get().fetchBills();
            return { success: true, data: res.data, message: res.message };
          }
          return { success: false, message: res?.message || "Update failed." };
        } catch (err) {
          return { success: false, message: err.message || "Failed to update bill." };
        }
      },

      // ── Payments ─────────────────────────────────────────────────────────
      fetchPayments: async (billId = null) => {
        try {
          const res = await billingApi.getPayments(billId);
          if (res && res.success && Array.isArray(res.data)) {
            set({ payments: res.data });
            return { success: true, data: res.data };
          }
        } catch (err) {
          console.warn("Payments fetch failed:", err.message);
        }
        return { success: false, data: get().payments };
      },

      createPayment: async (payload) => {
        // payload: { bill_id, amount, payment_method, transaction_reference, status }
        try {
          const res = await billingApi.createPayment(payload);
          if (res && res.success) {
            // Refresh both payments and bills lists
            get().fetchPayments();
            get().fetchBills();
            get().fetchMyBills();
            get().fetchMyPayments();
            return { success: true, data: res.data, message: res.message };
          }
          return { success: false, message: res?.message || "Payment failed." };
        } catch (err) {
          return { success: false, message: err.message || "Failed to record payment." };
        }
      },

      getReceipt: async (paymentId) => {
        try {
          const res = await billingApi.getReceipt(paymentId);
          if (res && res.success) {
            return { success: true, data: res.data };
          }
          return { success: false, message: res?.message || "Receipt not found." };
        } catch (err) {
          return { success: false, message: err.message || "Failed to fetch receipt." };
        }
      },

      // ── Resident: my bills & payments ────────────────────────────────────
      fetchMyBills: async () => {
        try {
          const res = await billingApi.getMyBills();
          if (res && res.success && Array.isArray(res.data)) {
            set({ myBills: res.data });
            return { success: true, data: res.data };
          }
        } catch (err) {
          console.warn("My bills fetch failed:", err.message);
        }
        return { success: false, data: get().myBills };
      },

      fetchMyPayments: async () => {
        try {
          const res = await billingApi.getMyPayments();
          if (res && res.success && Array.isArray(res.data)) {
            set({ myPayments: res.data });
            return { success: true, data: res.data };
          }
        } catch (err) {
          console.warn("My payments fetch failed:", err.message);
        }
        return { success: false, data: get().myPayments };
      },

      reset: () => set({ bills: [], payments: [], summary: null, myBills: [], myPayments: [] }),
    }),
    { name: "billing-storage" }
  )
);

export default useBillingStore;