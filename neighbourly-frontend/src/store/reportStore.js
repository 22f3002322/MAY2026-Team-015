import { create } from "zustand";

const currentYear = new Date().getFullYear();

const useReportStore = create((set, get) => ({
  // ======================================
  // Report Filters
  // ======================================
  filters: {
    fromDate: "",
    toDate: "",
    month: "",
    year: currentYear,
  },

  updateFilters: (data) =>
    set((state) => ({
      filters: {
        ...state.filters,
        ...data,
      },
    })),

  resetFilters: () => {
    set({
      filters: {
        fromDate: "",
        toDate: "",
        month: "",
        year: currentYear,
      },
    });

    alert("Filters reset successfully!");
  },

  // ======================================
  // Dashboard Stats
  // ======================================
  stats: [
    {
      title: "Total Revenue",
      value: "₹12.8L",
      change: "+18%",
      trend: "up",
    },
    {
      title: "Occupancy Rate",
      value: "94%",
      change: "+2%",
      trend: "up",
    },
    {
      title: "Open Complaints",
      value: "18",
      change: "-6",
      trend: "down",
    },
    {
      title: "Total Visitors",
      value: "3,482",
      change: "+11%",
      trend: "up",
    },
  ],

  // ======================================
  // Revenue Chart
  // ======================================
  revenueData: [
    { month: "Jan", revenue: 820000 },
    { month: "Feb", revenue: 860000 },
    { month: "Mar", revenue: 910000 },
    { month: "Apr", revenue: 955000 },
    { month: "May", revenue: 990000 },
    { month: "Jun", revenue: 1030000 },
    { month: "Jul", revenue: 1080000 },
    { month: "Aug", revenue: 1120000 },
    { month: "Sep", revenue: 1160000 },
    { month: "Oct", revenue: 1200000 },
    { month: "Nov", revenue: 1240000 },
    { month: "Dec", revenue: 1280000 },
  ],

  // ======================================
  // Complaint Chart
  // ======================================
  complaintData: [
    {
      name: "Plumbing",
      value: 28,
    },
    {
      name: "Electrical",
      value: 22,
    },
    {
      name: "Cleaning",
      value: 18,
    },
    {
      name: "Parking",
      value: 15,
    },
    {
      name: "Security",
      value: 17,
    },
  ],

  // ======================================
  // Occupancy Chart
  // ======================================
  occupancyData: [
    {
      status: "Occupied",
      apartments: 188,
      color: "#22C55E",
    },
    {
      status: "Vacant",
      apartments: 12,
      color: "#F59E0B",
    },
    {
      status: "Maintenance",
      apartments: 5,
      color: "#EF4444",
    },
  ],

  // ======================================
  // Billing Chart
  // ======================================
  billingData: [
    {
      month: "Jan",
      paid: 180,
      pending: 12,
      overdue: 6,
    },
    {
      month: "Feb",
      paid: 184,
      pending: 10,
      overdue: 5,
    },
    {
      month: "Mar",
      paid: 190,
      pending: 8,
      overdue: 4,
    },
    {
      month: "Apr",
      paid: 186,
      pending: 11,
      overdue: 3,
    },
    {
      month: "May",
      paid: 192,
      pending: 6,
      overdue: 2,
    },
    {
      month: "Jun",
      paid: 195,
      pending: 4,
      overdue: 1,
    },
  ],

  // ======================================
  // Poll Chart
  // ======================================
  pollData: [
    {
      poll: "Parking\nAllocation",
      votes: 168,
      color: "#4F46E5",
    },
    {
      poll: "Security\nUpgrade",
      votes: 152,
      color: "#22C55E",
    },
    {
      poll: "Clubhouse\nRenovation",
      votes: 141,
      color: "#F59E0B",
    },
    {
      poll: "Maintenance\nBudget",
      votes: 126,
      color: "#EF4444",
    },
  ],

  // ======================================
  // Visitor Chart
  // ======================================
  visitorData: [
    {
      day: "Mon",
      visitors: 42,
    },
    {
      day: "Tue",
      visitors: 58,
    },
    {
      day: "Wed",
      visitors: 51,
    },
    {
      day: "Thu",
      visitors: 67,
    },
    {
      day: "Fri",
      visitors: 82,
    },
    {
      day: "Sat",
      visitors: 124,
    },
    {
      day: "Sun",
      visitors: 98,
    },
  ],

  // ======================================
  // Export Actions
  // ======================================
  exportPDF: () => {
    alert("PDF export will be connected to backend.");
    console.log("Export PDF", get().filters);
  },

  exportExcel: () => {
    alert("Excel export will be connected to backend.");
    console.log("Export Excel", get().filters);
  },

  exportCSV: () => {
    alert("CSV export will be connected to backend.");
    console.log("Export CSV", get().filters);
  },

  printReport: () => {
    window.print();
  },

  emailReport: () => {
    alert("Email service will be connected to backend.");
    console.log("Email Report");
  },

  // ======================================
  // Helper Actions (Optional)
  // ======================================
  setRevenueData: (data) =>
    set({ revenueData: data }),

  setComplaintData: (data) =>
    set({ complaintData: data }),

  setOccupancyData: (data) =>
    set({ occupancyData: data }),

  setBillingData: (data) =>
    set({ billingData: data }),

  setPollData: (data) =>
    set({ pollData: data }),

  setVisitorData: (data) =>
    set({ visitorData: data }),

  setStats: (stats) =>
    set({ stats }),
}));

export default useReportStore;