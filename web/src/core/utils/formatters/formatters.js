// src/utils/formatters.js
export const fmtMoney = (v = 0) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(Number(v) || 0);

export const fmtDate = (d) =>
    new Date(new Date(d).getTime() - 7 * 60 * 60 * 1000).toLocaleString("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    });