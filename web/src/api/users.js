// src/api/users.js
import { apiFetch } from "./client";

export const UsersApi = {
  // Listar todos
  list: () => apiFetch("/users"),

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

  // Eliminar
  remove: (id) =>
    apiFetch(`/users/${id}`, {
      method: "DELETE",
    }),

  // Cambiar modo oscuro
  updateDarkMode: (userId, darkMode) =>
    apiFetch(`/users/${userId}/dark-mode`, {
      method: "PUT",
      body: JSON.stringify({ darkMode }),
    }),

  // ✅ Activar / Inhabilitar (soft delete)
  toggleStatus: (id, newStatus) =>
    apiFetch(`/users/${id}/${newStatus ? "activate" : "deactivate"}`, {
      method: "PUT",
    }),
};
