import { apiFetch } from "@core/api/client";

export const SalesApi = {
  list: () => apiFetch("/sales"),
  get: (id) => apiFetch(`/sales/${id}`),
  create: async (payload) => {
    try {
      return await apiFetch("/sales", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error("Error creando venta:", error);
      throw error;
    }
  },
};
