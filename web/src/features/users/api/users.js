import { apiFetch } from "@core/api/client";

export const UsersApi = {
  // Listar todos
  list: (status = "active") => apiFetch(`/users?status=${status}`),

  // Obtener uno
  get: (id) => apiFetch(`/users/${id}`),

  // Crear
  create: (payload) =>
    apiFetch("/users", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Actualizar
  update: (id, payload) =>
    apiFetch(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  // Desactivar usuario (status = 'inactive')
  desactive: (id) =>
    apiFetch(`/users/${id}/deactivate`, {
      method: "PUT",
    }),

  // Eliminar usuario (status = 'deleted')
  remove: (id) =>
    apiFetch(`/users/${id}/delete`, {
      method: "PUT",
    }),

  // Cambiar modo oscuro (opcional)
  updateDarkMode: (userId, darkMode) =>
    apiFetch(`/users/${userId}/dark-mode`, {
      method: "PUT",
      body: JSON.stringify({ darkMode }),
    }),
};
