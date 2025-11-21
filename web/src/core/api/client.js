const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  // Construimos las cabeceras dinámicamente
  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  // ⛔ Si NO es FormData → usar JSON
  if (!options.isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const config = {
    method: "GET",
    headers,
    ...options, // ← body, method, etc.
  };

  const res = await fetch(`${API_URL}${endpoint}`, config);

  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    return;
  }

  if (!res.ok) {
    let errorMsg = `Error ${res.status}`;
    try {
      const err = await res.json();
      errorMsg = err.error || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }

  if (res.status === 204) return null;

  // Intentar parsear JSON
  try {
    return await res.json();
  } catch {
    return null;
  }
}
