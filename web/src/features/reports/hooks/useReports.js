// src/hooks/useReports.js
import { useState } from "react";
import { ReportsApi } from "../api/reports";

export function useReports() {
  const [data, setData] = useState({
    stock: [],
    sales: [],
    purchases: [],
    topProducts: [],
    dashboard: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔹 Cargar inventario
  async function fetchStock(branchId = null, categoryId = null) {
    setLoading(true);
    try {
      const res = await ReportsApi.stock(branchId, categoryId);
      setData((prev) => ({ ...prev, stock: res }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }


  // 🔹 Cargar ventas
  async function fetchSales({ startDate, endDate }) {
    setLoading(true);
    try {
      const res = await ReportsApi.sales(startDate, endDate);
      setData((prev) => ({ ...prev, sales: res }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // 🔹 Cargar compras
  async function fetchPurchases(startDate, endDate) {
    setLoading(true);
    try {
      const res = await ReportsApi.purchases(startDate, endDate);
      setData((prev) => ({ ...prev, purchases: res }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // 🔹 Cargar top productos
  async function fetchTopProducts(limit = 10) {
    setLoading(true);
    try {
      const res = await ReportsApi.topProducts(limit);
      setData((prev) => ({ ...prev, topProducts: res }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // 🔹 Cargar dashboard general
  async function fetchDashboard(startDate, endDate) {
    setLoading(true);
    try {
      const res = await ReportsApi.dashboard(startDate, endDate);
      setData((prev) => ({ ...prev, dashboard: res }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return {
    data,
    loading,
    error,
    fetchStock,
    fetchSales,
    fetchPurchases,
    fetchTopProducts,
    fetchDashboard,
  };
}
