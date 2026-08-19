/** Map API blocks to select options. */
export function blockOptions(blocks = []) {
  return (blocks || []).map((b) => ({
    value: String(b.block_id),
    label: b.block_name,
    block_id: b.block_id,
    block_name: b.block_name,
    total_flats: b.total_flats,
  }));
}

/** Occupancy type: UI Tenant ↔ API Rental */
export function occupancyToApi(uiValue) {
  const v = String(uiValue || "").toLowerCase();
  if (v === "tenant" || v === "rental") return "Rental";
  if (v === "owner") return "Owner";
  return null;
}

export function occupancyToUi(apiValue) {
  const v = String(apiValue || "");
  if (v === "Rental") return "Tenant";
  if (v === "Owner") return "Owner";
  return v || "";
}

export const OCCUPANCY_UI_OPTIONS = ["Owner", "Tenant"];

/** Complaint / booking / billing / notice enums */
export const COMPLAINT_STATUS = [
  { value: "open", label: "Open" },
  { value: "assigned", label: "Assigned" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

export const COMPLAINT_PRIORITY = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export const BOOKING_STATUS = [
  { value: "booked", label: "Booked" },
  { value: "approved", label: "Approved" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export const BILL_STATUS = [
  { value: "unpaid", label: "Unpaid" },
  { value: "paid", label: "Paid" },
];

export const NOTICE_PRIORITY = [
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export function labelFor(options, value) {
  const found = options.find((o) => o.value === String(value || "").toLowerCase() || o.value === value);
  return found?.label || value || "";
}

export function toApiStatus(uiOrApi, options) {
  const raw = String(uiOrApi || "").trim();
  const lower = raw.toLowerCase().replace(/\s+/g, "_");
  const byValue = options.find((o) => o.value === lower || o.value === raw);
  if (byValue) return byValue.value;
  const byLabel = options.find((o) => o.label.toLowerCase() === raw.toLowerCase());
  return byLabel?.value || lower;
}
