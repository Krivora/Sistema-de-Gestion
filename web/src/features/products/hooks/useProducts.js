import { useState, useEffect } from "react";
import { ProductsApi } from "../api/products";
import { useAuth } from "@core/auth/useAuth"
import { useNotify } from "@core/utils/alerts/notifyUtils";

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();
  const notify = useNotify();

  // 🔹 Obtener productos
  const fetchProducts = async () => {
    if (!currentUser?.client_id) return;
    setLoading(true);
    try {
      const data = await ProductsApi.list();
      setProducts(data);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Crear
  const addProduct = async (payload) => {
    const newProd = await ProductsApi.create({
      ...payload,
      client_id: currentUser?.client_id ?? null,
    });
    fetchProducts();
    setProducts((prev) => [...prev, newProd]);
  };

  // 🔹 Actualizar
  const updateProduct = async (id, payload) => {
    const updated = await ProductsApi.update(id, payload);
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    notify.success("Producto actualizado", "Cambios guardados.");
  };

  // 🔹 Desactivar
  const desactivateProduct = async (id) => {
    const data = await ProductsApi.desactivate(id);
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "inactive" } : p))
    );
    return data.message;
  };

  // 🔹 Activar
  const activateProduct = async (id) => {
    const data = await ProductsApi.activate(id);
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "active" } : p))
    );
    return data.message;
  };

  // 🔹 Eliminar
  const deleteProduct = async (id) => {
    const data = await ProductsApi.delete(id);
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "deleted" } : p))
    );
    return data.message;
  };

  // Inicial
  useEffect(() => {
    fetchProducts();
  }, [currentUser?.client_id]);

  return {
    products,
    loading,
    addProduct,
    updateProduct,
    activateProduct,
    desactivateProduct,
    deleteProduct,
  };
}
