/** Strip leftover markdown and raw DB ids from assistant chat text. */
export function formatChatReply(text) {
  if (!text) return "";
  return String(text)
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/`/g, "")
    .replace(/\s*\((?:announcement|complaint|notice)_id\s*=\s*\d+\)/gi, "")
    .replace(/\b(?:announcement_id|complaint_id|notice_id)\s*=\s*\d+\b/gi, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/ {2,}/g, " ")
    .trim();
}
