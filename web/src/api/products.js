import { apiFetch } from "./client";

export const ProductsApi = {
  list: () => apiFetch("/products"),
  get: (id) => apiFetch(`/products/${id}`),
  create: (payload) =>
    apiFetch("/products", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  update: (id, payload) =>
    apiFetch(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  // 🟢 Activar
  activate: (id) =>
    apiFetch(`/products/${id}/activate`, {
      method: "PUT",
    }),

  // 🟠 Desactivar
  desactivate: (id) =>
    apiFetch(`/products/${id}/desactivate`, {
      method: "PUT",
    }),

  // 🔴 Eliminar (soft delete)
  delete: (id) =>
    apiFetch(`/products/${id}/delete`, {
      method: "PUT",
    }),
};
