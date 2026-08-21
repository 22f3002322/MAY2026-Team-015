/**
 * Role-aware copy and citation routes for the AI assistant.
 * Chat/search are grounded on complaints + announcements only.
 */

export function resolveStaffRole(user, backendRole) {
  if (user?.staffRole === "maintenance" || user?.staffRole === "security") {
    return user.staffRole;
  }
  const raw = String(backendRole || user?.role || "").toLowerCase();
  if (raw === "maintenance") return "maintenance";
  if (raw === "security") return "security";
  return null;
}

export function getStarterChips({ role, staffRole }) {
  if (role === "admin") {
    return [
      "What high-priority complaints are still open?",
      "What are the latest notices?",
    ];
  }

  if (role === "resident") {
    return [
      "What's the status of my open complaints?",
      "What are the latest notices?",
      "How do I file a complaint?",
    ];
  }

  if (role === "staff" && staffRole === "maintenance") {
    return [
      "What's my oldest open task?",
      "Any notices that affect my work?",
    ];
  }

  if (role === "staff") {
    return [
      "What notices are active today?",
      "Summarize the latest announcements.",
    ];
  }

  return [];
}

export function getAssistantHint({ role, staffRole }) {
  if (role === "staff" && staffRole === "security") {
    return "I can answer from today's notices. I cannot look up visitor OTPs or check-in logs.";
  }
  if (role === "staff" && staffRole === "maintenance") {
    return "I can answer from your assigned complaints and society notices.";
  }
  if (role === "resident") {
    return "I can answer from your complaints and society notices — not bills, visitors, or bookings.";
  }
  return "I can answer from recent complaints and society notices.";
}

export function getSearchEmptyHint({ role, staffRole }) {
  if (role === "staff" && staffRole === "security") {
    return "Search looks at active notices only. Visitor OTPs and logs are not included.";
  }
  if (role === "staff" && staffRole === "maintenance") {
    return "Search covers your assigned complaints and active notices.";
  }
  if (role === "resident") {
    return "Search covers your complaints and active notices.";
  }
  return "Search covers society complaints and active notices.";
}

/** Path to an existing page for a citation, or null if this role has no matching screen. */
export function citationPath(entityType, { role, staffRole }) {
  if (entityType === "complaint") {
    if (role === "admin") return "/admin/complaints";
    if (role === "resident") return "/resident/complaints";
    if (staffRole === "maintenance") return "/staff/complaints";
    return null;
  }
  if (entityType === "announcement") {
    if (role === "admin") return "/admin/notices";
    if (role === "resident") return "/resident/notices";
    return null;
  }
  return null;
}

export function citationLabel(entityType, entityId) {
  if (entityType === "complaint") return `Complaint #${entityId}`;
  if (entityType === "announcement") return `Notice #${entityId}`;
  return `${entityType} #${entityId}`;
}
