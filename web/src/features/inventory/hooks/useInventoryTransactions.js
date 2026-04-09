import { useEffect, useState } from "react";
import { InventoryTransactionsApi } from "../api/inventoryTransactions";
import { useAuth } from "@core/auth/useAuth" // 👈 para obtener el cliente actual

export function useInventoryTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user: currentUser } = useAuth(); // 👈 usuario logueado

  // 🔹 Listar movimientos (filtrados por cliente)
  const fetchTransactions = async (params = {}) => {
    if (!currentUser?.client_id) return; // evita llamadas si no hay cliente activo
    setLoading(true);
    try {
      const data = await InventoryTransactionsApi.list({
        ...params,
        client_id: currentUser.client_id, // 👈 filtro automático
      });
      setTransactions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  // 🔹 Cargar automáticamente al montar
  useEffect(() => {
    fetchTransactions();
  }, [currentUser?.client_id]); // 👈 refetch cuando cambie el cliente

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
  };
}
