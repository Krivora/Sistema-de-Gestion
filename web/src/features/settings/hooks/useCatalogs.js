import { useEffect, useState } from "react";
import { CatalogsApi } from "../api/catalogs";
import { useToast } from "@core/utils/alerts/toastUtils";
import { useAuth } from "@core/auth/useAuth"

export function useCatalog(code) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { user } = useAuth();

  // 📦 Cargar items del catálogo
  const fetchItems = async () => {
    if (!code || !user?.client_id) return;
    setLoading(true);
    try {
      const data = await CatalogsApi.listItems(code);
      setItems(data);
    } catch (err) {
      toast.error(`Error al cargar catálogo (${code})`);
    } finally {
      setLoading(false);
    }
  };

  // ➕ Crear nuevo item
  const createItem = async (payload) => {
    try {
      const created = await CatalogsApi.createItem(code, payload);
      setItems((prev) => [...prev, created]);
      toast.success("Elemento creado correctamente");
      return created;
    } catch (err) {
      toast.error("Error al crear elemento");
      throw err;
    }
  };

  // ✏️ Actualizar item
  const updateItem = async (id, payload) => {
    try {
      const updated = await CatalogsApi.updateItem(id, payload);
      setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
      toast.success("Elemento actualizado");
      return updated;
    } catch (err) {
      toast.error("Error al actualizar elemento");
    }
  };

  // 🚫 Soft delete (mover a eliminados)
  const deleteItem = async (id) => {
    try {
      const deleted = await CatalogsApi.deleteItem(id);
      setItems((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, deleted_at: new Date().toISOString() } : i
        )
      );
      return deleted;
    } catch (err) {
    }
  };

  // ♻️ Restaurar (mover a activos)
  const restoreItem = async (id) => {
    try {
      const restored = await CatalogsApi.restoreItem(id);
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, deleted_at: null } : i))
      );
      return restored;
    } catch (err) {
    }
  };

  // 🔁 Cargar al montar
  useEffect(() => {
    fetchItems();
  }, [code, user?.client_id]);

  return {
    items,
    loading,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    restoreItem,
  };
}
