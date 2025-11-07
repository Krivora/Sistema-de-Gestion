import { useEffect, useState } from "react";
import { TransfersApi } from "../api/transfers";
import { useAuth } from "@core/context/AuthProvider";

export function useTransfers() {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user: currentUser } = useAuth();

  // 🔹 Obtener todas las transferencias
  const fetchTransfers = async () => {
    if (!currentUser?.client_id) return;
    setLoading(true);
    try {
      const data = await TransfersApi.list();
      setTransfers(data);
    } catch (err) {
      setError(err.message || "Error al cargar transferencias");
    } finally {
      setLoading(false);
    }
  };

  // ➕ Crear transferencia
  const createTransfer = async (payload) => {
    try {
      const created = await TransfersApi.create(payload);
      setTransfers((prev) => [created, ...prev]);
      await fetchTransfers();
      return created;
    } catch (err) {
      console.error("❌ Error al crear transferencia:", err.message);
      throw err; // 👈 vuelve a lanzar el error con el mensaje del backend
    }
  };


  // 🔍 Obtener una transferencia específica
  const getTransfer = async (id) => {
    return await TransfersApi.get(id);
  };

  useEffect(() => {
    fetchTransfers();
  }, [currentUser?.client_id]);

  return {
    transfers,
    loading,
    error,
    fetchTransfers,
    createTransfer,
    getTransfer,
  };
}
