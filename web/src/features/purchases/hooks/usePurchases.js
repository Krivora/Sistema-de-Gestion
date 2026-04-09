import { useEffect, useState } from "react";
import { PurchasesApi } from "../api/purchases";
import { BranchProductsApi } from "@features/branchProducts/api/branchProducts";
import { useAuth } from "@core/auth/useAuth"

export function usePurchases(defaultBranchId = "") {
  const [purchases, setPurchases] = useState([]);
  const [branchProducts, setBranchProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState(null);
  const [branchId, setBranchId] = useState(defaultBranchId);
  const { user: currentUser } = useAuth();

  // 🔹 Obtener compras
  const fetchPurchases = async (bId = branchId) => {
    if (!currentUser?.client_id) return;
    setLoading(true);
    try {
      const data = bId
        ? await PurchasesApi.listByBranch(bId)
        : await PurchasesApi.list();
      setPurchases(data);
    } catch (err) {
      console.error("❌ Error cargando compras:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Productos por sucursal
  const fetchBranchProducts = async (bId = branchId) => {
    if (!bId) {
      setBranchProducts([]);
      return;
    }

    try {
      setLoadingProducts(true);
      const data = await BranchProductsApi.listByBranch(bId);
      setBranchProducts((data || []).filter((p) => p.is_active));
    } catch (err) {
      console.error("❌ Error cargando productos de sucursal:", err);
      setError(err.message);
    } finally {
      setLoadingProducts(false);
    }
  };

  // 🔹 Crear compra con validaciones
  const createPurchase = async (purchase) => {
    if (!currentUser?.client_id) throw new Error("Cliente no autenticado");
    if (!purchase.branch_id) throw new Error("Debes seleccionar una sucursal");

    if (purchase.product_id) {
      const exists = branchProducts.some(
        (p) => p.product_id === purchase.product_id
      );
      if (!exists) {
        throw new Error("El producto seleccionado no está asignado a esta sucursal");
      }
    }

    const created = await PurchasesApi.create({
      ...purchase,
      client_id: currentUser.client_id,
    });

    if (!branchId || Number(branchId) === Number(created.branch_id)) {
      setPurchases((prev) => [created, ...prev]);
    }

    await fetchPurchases();
    return created;
  };

  // 🔹 Obtener compra por ID (para detalles)
  const getPurchaseById = async (id) => {
    return await PurchasesApi.get(id);
  };

  // 🔹 Cargar datos iniciales
  useEffect(() => {
    fetchPurchases();
    fetchBranchProducts();
  }, [branchId, currentUser?.client_id]);

  return {
    purchases,
    branchProducts,
    loading,
    loadingProducts,
    error,
    branchId,
    setBranchId,
    fetchPurchases,
    fetchBranchProducts,
    createPurchase,
    getPurchaseById,
  };
}
