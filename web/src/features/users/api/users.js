import { apiFetch } from "@core/api/client";

// Valida que el id sea un número positivo antes de cualquier llamada
function assertId(id, label = "id") {
  if (!id || typeof id !== "number" || !Number.isInteger(id) || id <= 0) {
    throw new Error(`UsersApi: "${label}" inválido → ${id}`);
  }
}

export const UsersApi = {
  list: (status = "active") => {
    const allowed = ["active", "inactive", "deleted"];
    const safe = allowed.includes(status) ? status : "active";
    return apiFetch(`/users?status=${safe}`);
  },

  get: (id) => {
    assertId(id);
    return apiFetch(`/users/${id}`);
  },

  create: (payload) => {
    if (!payload?.name || !payload?.email || !payload?.password || !payload?.role_id) {
      throw new Error("UsersApi.create: faltan campos requeridos (name, email, password, role_id)");
    }
    return apiFetch("/users", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update: (id, payload) => {
    assertId(id);
    if (!payload || typeof payload !== "object" || Object.keys(payload).length === 0) {
      throw new Error("UsersApi.update: payload vacío");
    }
    return apiFetch(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  // ← PATCH, no PUT
  deactivate: (id) => {
    assertId(id);
    return apiFetch(`/users/${id}/deactivate`, { method: "PATCH" });
  },

  // ← PATCH, no PUT
  remove: (id) => {
    assertId(id);
    return apiFetch(`/users/${id}/delete`, { method: "PATCH" });
  },

  updateDarkMode: (id, darkMode) => {
    assertId(id);
    if (typeof darkMode !== "boolean") {
      throw new Error("UsersApi.updateDarkMode: darkMode debe ser boolean");
    }
    return apiFetch(`/users/${id}/dark-mode`, {
      method: "PATCH",
      body: JSON.stringify({ darkMode }),
    });
  },
};