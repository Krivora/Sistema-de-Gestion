import { useEffect, useState } from "react";
import { TransfersApi } from "../api/transfers";
import { useAuth } from "@core/context/AuthProvider"; // 👈 obtenemos el cliente actual

export function useTransfers() {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user: currentUser } = useAuth(); // 👈 usuario logueado

  // 🔹 Obtener todas las transferencias del cliente actual
  const fetchTransfers = async () => {
    if (!currentUser?.client_id) return; // evita llamadas sin cliente activo
    setLoading(true);
    try {
      const data = await TransfersApi.list({
        client_id: currentUser.client_id, // 👈 filtro automático
      });
      setTransfers(data);
    } catch (err) {
      setError(err.message || "Error al cargar transferencias");
    } finally {
      setLoading(false);
    }
  };

  // ➕ Crear transferencia
  const createTransfer = async (payload) => {
    if (!currentUser?.client_id) return;

    const created = await TransfersApi.create({
      ...payload,
      client_id: currentUser.client_id, // 👈 se adjunta automáticamente
    });

    setTransfers((prev) => [created, ...prev]);
    await fetchTransfers(); // Refresca lista después de crear
    return created;
  };

  // 🔹 Obtener transferencia por ID
  const getTransfer = async (id) => {
    return await TransfersApi.get(id);
  };

  // 🔹 Cargar transferencias al montar o cuando cambie cliente
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
