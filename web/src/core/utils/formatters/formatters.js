// src/utils/formatters.js
export const fmtMoney = (v = 0) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(Number(v) || 0);



export const fmtDate = (d) =>
  new Date(d).toLocaleDateString("es-MX", { year: "numeric", month: "short", day: "2-digit" });
