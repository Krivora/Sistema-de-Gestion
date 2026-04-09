const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const TOKEN_KEY = "app_token";
const SESSION_FLAG = "app_has_session";

let _memoryToken = sessionStorage.getItem(TOKEN_KEY) || null;

export const tokenStore = {
  get: () => _memoryToken,

  set: (token) => {
    _memoryToken = token;
    try {
      sessionStorage.setItem(TOKEN_KEY, token);
      sessionStorage.setItem(SESSION_FLAG, "1");
    } catch {
      // Ignorar errores de almacenamiento
    }
  },

  clear: () => {
    _memoryToken = null;
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(SESSION_FLAG);
  },
  hasToken: () => {
  return Boolean(
      _memoryToken || sessionStorage.getItem(TOKEN_KEY)
    );
  },
  hasFlag: () => sessionStorage.getItem(SESSION_FLAG) === "1",

  restore: () => {
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (token) _memoryToken = token;
    return token;
  },
};

export async function apiFetch(endpoint, options = {}) {
  const token = tokenStore.get();
  const { isFormData, headers: customHeaders = {}, ...fetchOptions } = options;

  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(!isFormData && { "Content-Type": "application/json" }),
    ...customHeaders,
  };

  let res;
  try {
    res = await fetch(`${API_URL}${endpoint}`, {
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
    const error = new Error(body?.error || `Error ${res.status}`);
    error.status = res.status;
    error.data = body;
    throw error;
  }

  return body;
}