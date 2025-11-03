import { useEffect, useState } from "react";
import { PurchasesApi } from "../api/purchases";
import { useAuth } from "@core/context/AuthProvider"; // 👈 para obtener el cliente actual

export function usePurchases() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user: currentUser } = useAuth(); // 👈 usuario logueado

  // 🔹 Obtener todas las compras del cliente actual
  const fetchPurchases = async () => {
    if (!currentUser?.client_id) return; // evita llamadas si no hay cliente
    setLoading(true);
    try {
      const data = await PurchasesApi.list({
        client_id: currentUser.client_id, // 👈 filtro automático
      });
      setPurchases(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Crear nueva compra
  const createPurchase = async (purchase) => {
    if (!currentUser?.client_id) return;

    const created = await PurchasesApi.create({
      ...purchase,
      client_id: currentUser.client_id, // 👈 se adjunta automáticamente
    });

    // ✅ Actualizar lista en memoria + refetch para sincronizar
    setPurchases((prev) => [created, ...prev]);
    await fetchPurchases();

    return created;
  };

  // 🔹 Cargar compras al montar o cuando cambie el cliente
  useEffect(() => {
    fetchPurchases();
  }, [currentUser?.client_id]);

  return {
    purchases,
    loading,
    error,
    fetchPurchases,
    createPurchase,
  };
}
