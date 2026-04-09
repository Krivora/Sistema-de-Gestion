const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// Token vive en memoria — no en localStorage (seguro contra XSS)
let _memoryToken = null;

export const tokenStore = {
  get: () => _memoryToken,
  set: (token) => { _memoryToken = token; },
  clear: () => { _memoryToken = null; },
};

export async function apiFetch(endpoint, options = {}) {
  const token = tokenStore.get();

  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(!options.isFormData && { "Content-Type": "application/json" }),
  };

  // Separamos isFormData del resto para no pasarlo al fetch nativo
  const { isFormData, ...fetchOptions } = options;

  let res;
  try {
    res = await fetch(`${API_URL}${endpoint}`, {
      method: "GET",
      ...fetchOptions,
      headers,
    });
  } catch {
    throw new Error("Sin conexión con el servidor. Verifica tu red.");
  }

  if (res.status === 401) {
    tokenStore.clear();
    window.location.replace("/login");
    return;
  }

  if (res.status === 204) return null;

  let body = null;
  try {
    body = await res.json();
  } catch {
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return null;
  }

  if (!res.ok) {
    const message = body?.error || `Error ${res.status}`;
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }

  return body;
}