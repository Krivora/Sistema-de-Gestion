import { useEffect, useState } from "react";
import { TransfersApi } from "@/api/transfers";

export function useTransfers() {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔹 Obtener todas
  async function fetchTransfers() {
    setLoading(true);
    try {
      const data = await TransfersApi.list();
      setTransfers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ➕ Crear
  async function createTransfer(payload) {
    const created = await TransfersApi.create(payload);
    setTransfers((prev) => [created, ...prev]);
    return created;
  }

  // 🔹 Obtener por id
  async function getTransfer(id) {
    return await TransfersApi.get(id);
  }

  useEffect(() => {
    fetchTransfers();
  }, []);

  return {
    transfers,
    loading,
    error,
    fetchTransfers,
    createTransfer,
    getTransfer,
  };
}
