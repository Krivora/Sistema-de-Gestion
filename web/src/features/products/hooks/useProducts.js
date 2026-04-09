import { useState, useEffect, useCallback } from "react";
import { ProductsApi } from "../api/products";
import { useAuth } from "@core/auth/useAuth";

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchProducts = useCallback(async () => {
    if (!user?.client_id) return;

    setLoading(true);
    try {
      const data = await ProductsApi.list();
      console.log("Products API response:", data);
      setProducts(Array.isArray(data) ? data : data?.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [user?.client_id]);

  useEffect(() => {
    if (user && user.client_id) {
      fetchProducts();
    } else {
      setLoading(false);
    }
  }, [user, fetchProducts]);

  const addProduct = async (payload) => {
    const newProd = await ProductsApi.create(payload);
    setProducts((prev) => [newProd, ...prev]);
    return newProd;
  };

  const updateProduct = async (id, payload) => {
    const updated = await ProductsApi.update(id, payload);
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? updated : p))
    );
    return updated;
  };

  const activateProduct = async (id) => {
    await ProductsApi.activate(id);
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: "active" } : p
      )
    );
  };

  const deactivateProduct = async (id) => {
    await ProductsApi.deactivate(id);
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: "inactive" } : p
      )
    );
  };

  const deleteProduct = async (id) => {
    await ProductsApi.delete(id);
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: "deleted" } : p
      )
    );
  };

  return {
    products,
    loading,
    addProduct,
    updateProduct,
    activateProduct,
    deactivateProduct,
    deleteProduct,
    refetch: fetchProducts,
  };
}