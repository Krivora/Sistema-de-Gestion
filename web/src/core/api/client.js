// src/api/client.js
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const config = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  };

  const res = await fetch(`${API_URL}${endpoint}`, config);
  if (res.status === 401) {
    // Token inválido o expirado → limpiar sesión
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

  // No hay contenido
  if (res.status === 204) return null;

  return await res.json();
}
