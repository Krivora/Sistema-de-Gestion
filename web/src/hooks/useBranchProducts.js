import { useEffect, useState } from "react";
import { BranchProductsApi } from "../api";
import { useAuth } from "@/context/AuthProvider";

export function useBranchProducts(defaultBranchId = "") {
  const [items, setItems] = useState([]);
  const [branchId, setBranchId] = useState(defaultBranchId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user: currentUser } = useAuth();

  // 🔹 Cargar productos por sucursal cuando cambia el branchId
  useEffect(() => {
    fetchBranchProducts(branchId);
  }, [branchId]);


  // ✅ Función interna con nombre único (no colisiona con window.fetch)
  const fetchBranchProducts = async (bId = branchId) => {
    try {
      setLoading(true);
      const data = bId
        ? await BranchProductsApi.listByBranch(bId)
        : await BranchProductsApi.listAll();
      setItems(data);
    } catch (err) {
      console.error("Error cargando productos de sucursal:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // 🧾 CRUD helpers
  const createItem = async (payload) => {
    const created = await BranchProductsApi.create({
      ...payload,
      client_id: currentUser?.client_id ?? null, // 👈 se pasa automático
    });

    // actualizar listado si corresponde a la sucursal actual
    if (!branchId || Number(branchId) === Number(created.branch_id)) {
      setItems((prev) => [created, ...prev]);
    }
  };


  const updateItem = async (id, payload) => {
    const updated = await BranchProductsApi.update(id, payload);
    setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
  };

  const deleteItem = async (id) => {
    await BranchProductsApi.remove(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const toggleStatus = async (id, is_active) => {
    const updated = await BranchProductsApi.toggleStatus(id, is_active);
    setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
  };

  return {
    items,
    loading,
    error,
    branchId,
    setBranchId,
    fetchBranchProducts,
    createItem,
    updateItem,
    deleteItem,
    toggleStatus,
  };
}
