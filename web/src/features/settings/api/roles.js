import { apiFetch } from "@core/api/client";

export const RolesApi = {
  // 📚 Listado de roles
  list: () => apiFetch("/roles"),

  // 📘 Obtener rol + permisos asignados
  getById: (id) => apiFetch(`/roles/${id}`),

  // ➕ Crear rol
  create: (payload) =>
    apiFetch("/roles", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // ✏️ Actualizar rol
  update: (id, payload) =>
    apiFetch(`/roles/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  // ❌ Eliminar rol
  remove: (id) =>
    apiFetch(`/roles/${id}`, {
      method: "DELETE",
    }),

  // 🛂 Asignar permisos a un rol
  assignPermissions: (id, permissions) =>
    apiFetch(`/roles/${id}/permissions`, {
      method: "POST",
      body: JSON.stringify({ permissions }),
    }),
};
