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
    await fetchPurchases(); // refresca lista completa
    return created;
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
  };
}
