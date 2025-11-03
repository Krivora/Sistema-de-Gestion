import { apiFetch } from "@core/api/client";

export const PurchasesApi = {
  // 📋 Listar todas las compras
  list: () => apiFetch("/purchases"),

  // 📄 Obtener una compra con ítems
  get: (id) => apiFetch(`/purchases/${id}`),

  // ➕ Crear nueva compra
  create: (payload) =>
    apiFetch("/purchases", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

};
