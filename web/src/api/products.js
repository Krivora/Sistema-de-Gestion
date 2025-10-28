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
  remove: (id) =>
    apiFetch(`/products/${id}/desactivate`, {
      method: "PUT",
    }),
};
