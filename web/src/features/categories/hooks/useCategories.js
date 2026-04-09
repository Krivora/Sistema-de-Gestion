import { useState, useEffect } from "react";
import { CategoriesApi } from "../api/categories";
import { useAuth } from "@core/auth/useAuth"

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user: currentUser } = useAuth();

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
    const newCategory = await CategoriesApi.create({
      ...payload,
      client_id: currentUser?.client_id ?? null,
    });
    setCategories((prev) => [...prev, newCategory]);
    return newCategory;
  };

  // 🔹 Actualizar
  const updateCategory = async (id, payload) => {
    const updated = await CategoriesApi.update(id, payload);
    setCategories((prev) => prev.map((cat) => (cat.id === id ? updated : cat)));
    return updated;
  };

  // Desactivar
  const desactivateCategory = async (id) => {
    const res = await CategoriesApi.desactivate(id);
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === id ? { ...cat, status: "inactive" } : cat
      )
    );
    return res.message;
  };

  // Activar
  const activateCategory = async (id) => {
    const res = await CategoriesApi.activate(id);
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === id ? { ...cat, status: "active" } : cat
      )
    );
    return res.message;
  };

  // Eliminar (soft delete)
  const deleteCategory = async (id) => {
    const res = await CategoriesApi.delete(id);
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
    return res.message;
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
    desactivateCategory,
    activateCategory,
    deleteCategory,
  };
}
