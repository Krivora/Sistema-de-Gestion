import { useEffect, useState } from "react";
import { PurchasesApi } from "../api";

export function usePurchases() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔹 Obtener todas
  async function fetchPurchases() {
    setLoading(true);
    try {
      const data = await PurchasesApi.list();
      setPurchases(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // 🔹 Crear
  async function createPurchase(purchase) {
    const created = await PurchasesApi.create(purchase);
    setPurchases((prev) => [created, ...prev]);
  }

  // 🔹 Eliminar
  async function deletePurchase(id) {
    await PurchasesApi.remove(id);
    setPurchases((prev) => prev.filter((p) => p.id !== id));
  }

  useEffect(() => {
    fetchPurchases();
  }, []);

  return {
    purchases,
    loading,
    error,
    fetchPurchases,
    createPurchase,
    deletePurchase,
  };
}
