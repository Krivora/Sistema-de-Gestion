import { useEffect, useState } from "react";
import { CatalogsApi } from "@/api/catalogs";
import { useToast } from "@/utils/toastUtils";
import { useAuth } from "@/context/AuthProvider";

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

  // 🚫 Soft delete
  const deleteItem = async (id) => {
    try {
      await CatalogsApi.deleteItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.info("Elemento eliminado");
    } catch (err) {
      toast.error("Error al eliminar elemento");
    }
  };

  // ♻️ Restaurar
  const restoreItem = async (id) => {
    try {
      await CatalogsApi.restoreItem(id);
      toast.success("Elemento restaurado");
      fetchItems();
    } catch (err) {
      toast.error("Error al restaurar elemento");
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
