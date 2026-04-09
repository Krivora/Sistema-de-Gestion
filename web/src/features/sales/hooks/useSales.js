import { useEffect, useState } from "react";
import { SalesApi } from "../api/sales";
import { useAuth } from "@core/auth/useAuth" // 👈 para obtener el cliente actual

export function useSales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user: currentUser } = useAuth(); // 👈 usuario logueado

  // 🔹 Obtener todas las ventas del cliente actual
  const fetchSales = async () => {
    if (!currentUser?.client_id) return; // evita llamadas si no hay cliente activo
    setLoading(true);
    try {
      const data = await SalesApi.list({
        client_id: currentUser.client_id, // 👈 filtro automático
      });
      setSales(data);
    } catch (err) {
      console.error("Error al cargar ventas:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Crear nueva venta
  const createSale = async (sale) => {
    if (!currentUser?.client_id) return;

    try {
      const created = await SalesApi.create({
        ...sale,
        client_id: currentUser.client_id, // 👈 se adjunta automáticamente
      });

      // Actualizar en memoria
      setSales((prev) => [created, ...prev]);
      await fetchSales(); // refresca lista completa
      return created;
    } catch (err) {
      console.error("Error en createSale:", err);
    }
  };

  // 🔹 Cargar ventas al montar o cuando cambie el cliente
  useEffect(() => {
    fetchSales();
  }, [currentUser?.client_id]);

  return {
    sales,
    loading,
    fetchSales,
    createSale,
  };
}
