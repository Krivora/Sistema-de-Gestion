import { useState, useEffect } from "react";
import { CategoriesApi } from "../api";

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔹 Obtener todas
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await CategoriesApi.list();
      setCategories(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Crear
  const addCategory = async (payload) => {
    const newCategory = await CategoriesApi.create(payload);
    setCategories((prev) => [...prev, newCategory]);
  };

  // 🔹 Actualizar
  const updateCategory = async (id, payload) => {
    const updated = await CategoriesApi.update(id, payload);
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? updated : cat))
    );
  };

  // 🔹 Eliminar física (si se usa)
  const deleteCategory = async (id) => {
    await CategoriesApi.remove(id);
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
  };

  // 🔹 Activar / Inhabilitar categoría
  const toggleCategoryStatus = async (id, newStatus) => {
    const updated = await CategoriesApi.toggleStatus(id, newStatus);
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? updated : cat))
    );
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus, // 👈 ahora disponible para la UI
  };
}
