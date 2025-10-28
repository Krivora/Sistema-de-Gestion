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
    
  // Eliminar categoría (borrado físico)
  remove: (id) =>
    apiFetch(`/branches/${id}/desactivate`, {
      method: "PUT",
    }),
};
