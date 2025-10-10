import { apiFetch } from "./client";

export const InventoryTransactionsApi = {
  // 📋 Listar todos (con filtros opcionales)
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/inventory-transactions${query ? `?${query}` : ""}`);
  },

  // 🔍 Obtener uno
  get: (id) => apiFetch(`/inventory-transactions/${id}`),

  // ➕ Crear
  create: (payload) =>
    apiFetch("/inventory-transactions", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // 🗑️ Eliminar
  remove: (id) =>
    apiFetch(`/inventory-transactions/${id}`, {
      method: "DELETE",
    }),

  // 📊 Obtener stock actual (por producto y sucursal)
  getStock: (branch_id, product_id) =>
    apiFetch(
      `/inventory-transactions/stock?branch_id=${branch_id}&product_id=${product_id}`
    ),
};
