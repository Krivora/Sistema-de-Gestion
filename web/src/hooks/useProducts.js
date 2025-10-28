import { useState, useEffect } from "react";
import { ProductsApi } from "../api";
import { useAuth } from "@/context/AuthProvider";

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth(); // 👈 usuario logueado

  // 🔹 Obtener productos (filtrados por cliente)
  const fetchProducts = async () => {
    if (!currentUser?.client_id) return; // evita llamadas sin cliente
    setLoading(true);
    try {
      const data = await ProductsApi.list({
        client_id: currentUser.client_id, // 👈 filtro automático
      });
      setProducts(data);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Agregar producto
  const addProduct = async (payload) => {
    if (!currentUser?.client_id) return;

    const newProd = await ProductsApi.create({
      ...payload,
      client_id: currentUser.client_id, // 👈 se adjunta automáticamente
    });

    setProducts((prev) => [...prev, newProd]);
    await fetchProducts(); // refrescar lista
  };

  // 🔹 Actualizar producto
  const updateProduct = async (id, payload) => {
    const updated = await ProductsApi.update(id, payload);
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    await fetchProducts();
  };

  // 🔹 Eliminar producto
  const deleteProduct = async (id) => {
    await ProductsApi.remove(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };
  // 🔹 Cargar productos al montar o cuando cambie el cliente
  useEffect(() => {
    fetchProducts();
  }, [currentUser?.client_id]);

  return {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
  };
}
