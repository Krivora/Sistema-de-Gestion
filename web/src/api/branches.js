import { apiFetch } from "./client";

export const BranchesApi = {
  // Listar todas
  list: () => apiFetch("/branches"),

  // Obtener una
  get: (id) => apiFetch(`/branches/${id}`),

  // Crear
  create: (payload) =>
    apiFetch("/branches", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Actualizar
  update: (id, payload) =>
    apiFetch(`/branches/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  // Cambiar estado (activar/desactivar)
  toggleStatus: (id, is_active) =>
    apiFetch(`/branches/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ is_active }),
    }),

  // Eliminar
  remove: (id) =>
    apiFetch(`/branches/${id}`, {
      method: "DELETE",
    }),
};
