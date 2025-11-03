import { apiFetch } from "@core/api/client";

export const AdjustmentsApi = {
  // 📋 Listar todos los ajustes
  list: () => apiFetch("/adjustments"),

  // 🔍 Obtener un ajuste con sus productos
  get: (id) => apiFetch(`/adjustments/${id}`),

  // ➕ Crear un nuevo ajuste multiproducto
  create: (payload) =>
    apiFetch("/adjustments", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
