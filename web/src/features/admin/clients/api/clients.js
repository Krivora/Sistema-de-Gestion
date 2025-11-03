import { apiFetch } from "@core/api/client";

export const ClientsApi = {
  list: () => apiFetch("/clients"),
  get: (id) => apiFetch(`/clients/${id}`),
  create: (payload) =>
    apiFetch("/clients", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  update: (id, payload) =>
    apiFetch(`/clients/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  toggleStatus: (id, is_active) =>
    apiFetch(`/clients/${id}/deactivate`, {
      method: "PATCH",
      body: JSON.stringify({ is_active }),
    }),
  remove: (id) =>
    apiFetch(`/clients/${id}`, {
      method: "DELETE",
    }),
};
