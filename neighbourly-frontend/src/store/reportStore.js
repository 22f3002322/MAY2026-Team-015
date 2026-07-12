import { create } from "zustand";

const currentYear = new Date().getFullYear();

const useReportStore = create((set) => ({
    filters: {
        fromDate: "",
        toDate: "",
        month: "",
        year: currentYear,
    },

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

    setOccupancyData: (data) =>
        set({
            occupancyData: data,
        }),

    setPollData: (data) =>
        set({
            pollData: data,
        }),

    updateFilters: (updatedFilters) =>
        set((state) => ({
            filters: {
                ...state.filters,
                ...updatedFilters,
            },
        })),

    resetFilters: () =>
        set({
            filters: {
                fromDate: "",
                toDate: "",
                month: "",
                year: currentYear,
            },
        }),

    exportPDF: () => {
        window.print();
    },

    exportExcel: () => {
        alert("Excel export will be connected to backend.");
    },

    exportCSV: () => {
        alert("CSV export will be connected to backend.");
    },

    setComplaintData: (data) =>
        set({
            complaintData: data,
        }),
}));

export default useReportStore;