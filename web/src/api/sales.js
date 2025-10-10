import { apiFetch } from "./client";

export const SalesApi = {
  list: () => apiFetch("/sales"),
  get: (id) => apiFetch(`/sales/${id}`),
  create: (payload) =>
    apiFetch("/sales", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  remove: (id) =>
    apiFetch(`/sales/${id}`, {
      method: "DELETE",
    }),
};
