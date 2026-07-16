import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialBills = [
  {
    id: crypto.randomUUID(),
    billId: "BILL-1001",
    resident: "John Smith",
    flat: "A-101",
    category: "Maintenance",
    amount: 2500,
    dueDate: "15 Jul 2026",
    paidDate: "",
    status: "Pending",
    paymentMethod: "",
    remarks: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    billId: "BILL-1002",
    resident: "Sarah Wilson",
    flat: "B-203",
    category: "Water",
    amount: 1200,
    dueDate: "10 Jul 2026",
    paidDate: "08 Jul 2026",
    status: "Paid",
    paymentMethod: "UPI",
    remarks: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const useBillingStore = create(
  persist(
    (set) => ({
      bills: initialBills,

      addBill: (bill) =>
        set((state) => ({
          bills: [
            ...state.bills,
            {
              ...bill,
              id: crypto.randomUUID(),
              billId:
                bill.billId ||
                `BILL-${Date.now()}`,
              createdAt:
                new Date().toISOString(),
            },
          ],
        })),

      updateBill: (updatedBill) =>
        set((state) => ({
          bills: state.bills.map((bill) =>
            bill.id === updatedBill.id
              ? {
                  ...bill,
                  ...updatedBill,
                }
              : bill
          ),
        })),

      deleteBill: (id) =>
        set((state) => ({
          bills: state.bills.filter(
            (bill) => bill.id !== id
          ),
        })),

      markPaid: (
        id,
        paymentMethod = "Cash"
      ) =>
        set((state) => ({
          bills: state.bills.map((bill) =>
            bill.id === id
              ? {
                  ...bill,
                  status: "Paid",
                  paymentMethod,
                  paidDate:
                    new Date().toLocaleDateString(
                      "en-GB",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }
                    ),
                }
              : bill
          ),
        })),

      markPending: (id) =>
        set((state) => ({
          bills: state.bills.map((bill) =>
            bill.id === id
              ? {
                  ...bill,
                  status: "Pending",
                  paidDate: "",
                  paymentMethod: "",
                }
              : bill
          ),
        })),
    }),
    {
      name: "billing-storage",
    }
  )
);

export default useBillingStore;