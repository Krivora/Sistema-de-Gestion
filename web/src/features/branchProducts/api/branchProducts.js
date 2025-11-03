import { apiFetch } from "@core/api/client";

export const BranchProductsApi = {
  // Listado global (opcional)
  listAll: () => apiFetch("/branch-products"),

  // Listar por sucursal
  listByBranch: (branchId) => apiFetch(`/branch-products/branch/${branchId}`),

  // Obtener uno
  get: (id) => apiFetch(`/branch-products/${id}`),

  // Crear
  create: (payload) =>
    apiFetch("/branch-products", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Actualizar
  update: (id, payload) =>
    apiFetch(`/branch-products/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  // Activar / Desactivar
  toggleStatus: (id, is_active) =>
    apiFetch(`/branch-products/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ is_active }),
    }),

  // Eliminar
  remove: (id) =>
    apiFetch(`/branch-products/${id}`, {
      method: "DELETE",
    }),
};
