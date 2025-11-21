export const fileUrl = (path) => {
  const BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";
  return path?.startsWith("http") ? path : `${BASE}${path}`;
};
