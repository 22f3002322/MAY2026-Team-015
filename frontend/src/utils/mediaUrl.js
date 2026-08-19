const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

/** Turn a relative MEDIA path into an absolute API URL. */
export function mediaUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const base = API_BASE.replace(/\/$/, "");
  const rel = path.startsWith("/") ? path : `/${path}`;
  return `${base}${rel}`;
}

export { API_BASE };
