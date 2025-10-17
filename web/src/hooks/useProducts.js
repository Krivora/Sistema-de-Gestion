import { useState, useEffect } from "react";
import { ProductsApi } from "../api";

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchProducts() {
    setLoading(true);
    const data = await ProductsApi.list();
    setProducts(data);
    console.log(data);
    setLoading(false);
  }

  async function addProduct(payload) {
    const newProd = await ProductsApi.create(payload);
    setProducts((prev) => [...prev, newProd]);
    await fetchProducts();
  }

  async function updateProduct(id, payload) {
    const updated = await ProductsApi.update(id, payload);
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    await fetchProducts();
  }

  async function deleteProduct(id) {
    await ProductsApi.remove(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  async function toggleProductStatus(id, newStatus) {
    const updated = await ProductsApi.toggleStatus(id, newStatus);
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    await fetchProducts();
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
  };
}
