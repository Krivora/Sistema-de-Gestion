import { apiFetch } from "@core/api/client";

export const ProductsApi = {
  list:       ()           => apiFetch("/products"),
  get:        (id)         => apiFetch(`/products/${id}`),
  create:     (payload)    => apiFetch("/products",             { method: "POST",  body: JSON.stringify(payload) }),
  update:     (id, payload)=> apiFetch(`/products/${id}`,       { method: "PUT",   body: JSON.stringify(payload) }),
  activate:   (id)         => apiFetch(`/products/${id}/activate`,   { method: "PATCH" }),
  deactivate: (id)         => apiFetch(`/products/${id}/deactivate`, { method: "PATCH" }),
  delete:     (id)         => apiFetch(`/products/${id}/delete`,     { method: "PATCH" }),
};