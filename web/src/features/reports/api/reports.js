// src/api/reports.js
import { apiFetch } from "@core/api/client";

export const ReportsApi = {
  // 📦 Inventario
  stock: (branchId = null) =>
    apiFetch(`/reports/stock${branchId ? `?branchId=${branchId}` : ""}`),

  // 💰 Ventas por periodo
  sales: (startDate, endDate) =>
    apiFetch(`/reports/sales?startDate=${startDate}&endDate=${endDate}`),

  // 🧾 Compras por periodo
  purchases: (startDate, endDate) =>
    apiFetch(`/reports/purchases?startDate=${startDate}&endDate=${endDate}`),

  // 🛍️ Top productos vendidos
  topProducts: (limit = 10) => apiFetch(`/reports/top-products?limit=${limit}`),

  // 📊 Dashboard resumen
  dashboard: (startDate, endDate) =>
    apiFetch(`/reports/dashboard?startDate=${startDate}&endDate=${endDate}`),
};
