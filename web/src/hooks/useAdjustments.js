import { useEffect, useState } from "react";
import { AdjustmentsApi } from "../api/adjustments";
import { useAuth } from "@/context/AuthProvider"; // 👈 usuario actual

export function useAdjustments() {
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user: currentUser } = useAuth();

  // 🔹 Obtener todos los ajustes del cliente actual
  const fetchAdjustments = async () => {
    if (!currentUser?.client_id) return;
    setLoading(true);
    try {
      const data = await AdjustmentsApi.list({
        client_id: currentUser.client_id,
      });
      setAdjustments(data?.data || data); // según cómo devuelvas desde el backend
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Crear nuevo ajuste
  const createAdjustment = async (adjustment) => {
    if (!currentUser?.client_id) return;

    const created = await AdjustmentsApi.create({
      ...adjustment,
      client_id: currentUser.client_id,
    });

    // ✅ Actualizar lista local y recargar desde el servidor
    setAdjustments((prev) => [created, ...prev]);
    await fetchAdjustments();

    return created;
  };

  // 🔹 Cargar al montar o cuando cambie el cliente
  useEffect(() => {
    fetchAdjustments();
  }, [currentUser?.client_id]);

  return {
    adjustments,
    loading,
    error,
    fetchAdjustments,
    createAdjustment,
  };
}
