import { useState, useEffect } from "react";
import { CategoriesApi } from "../api";
import { useAuth } from "@/context/AuthProvider";

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
    try {
      const newCategory = await CategoriesApi.create({
        ...payload,
        client_id: currentUser?.client_id ?? null,
      });
      setCategories((prev) => [...prev, newCategory]);
      return newCategory; // 👈 importante: devuelve el resultado
    } catch (err) {
      console.error("Error creando categoría:", err);
      throw err; // 👈 re-lanza el error para manejarlo en la page
    }
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
  };
}
