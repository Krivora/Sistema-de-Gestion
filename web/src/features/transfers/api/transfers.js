import { apiFetch } from "@core/api/client";

export const TransfersApi = {
  // 📋 Listar todas las transferencias
  list: () => apiFetch("/transfers"),

  // 📄 Obtener una transferencia con ítems
  get: (id) => apiFetch(`/transfers/${id}`),

  // ➕ Crear una nueva transferencia
  create: (payload) =>
    apiFetch("/transfers", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
