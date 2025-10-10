import { useEffect, useState } from "react";
import { InventoryTransactionsApi } from "../api";

export function useInventoryTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔹 Listar movimientos
  async function fetchTransactions(params = {}) {
    setLoading(true);
    try {
      const data = await InventoryTransactionsApi.list(params);
      setTransactions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // 🔹 Crear movimiento
  async function createTransaction(payload) {
    const newTx = await InventoryTransactionsApi.create(payload);
    setTransactions((prev) => [newTx, ...prev]);
    await fetchTransactions(); // Refrescar la lista
  }

  // 🔹 Eliminar
  async function deleteTransaction(id) {
    await InventoryTransactionsApi.remove(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }

  // 🔹 Montar
  useEffect(() => {
    fetchTransactions();
  }, []);

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
    createTransaction,
    deleteTransaction,
  };
}
