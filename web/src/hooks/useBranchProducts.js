import { useEffect, useState } from "react";
import { BranchProductsApi } from "../api";

export function useBranchProducts(defaultBranchId = "") {
  const [items, setItems] = useState([]);
  const [branchId, setBranchId] = useState(defaultBranchId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setItems([]);
    fetch();
  }, [branchId]);

  const fetch = async (bId = branchId) => {
    try {
      setLoading(true);
      const data = bId
        ? await BranchProductsApi.listByBranch(bId)
        : await BranchProductsApi.listAll();
      setItems(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const createItem = async (payload) => {
    const created = await BranchProductsApi.create(payload);
    // Si estás filtrando por sucursal, refresca o inserta si coincide
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
    fetch,
    createItem,
    updateItem,
    deleteItem,
    toggleStatus,
  };
}
