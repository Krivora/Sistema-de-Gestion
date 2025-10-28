import { useState } from "react";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useCategories } from "@/hooks/useCategories";
import CategoryTable from "@/components/client/categories/CategoryTable";
import CategoryForm from "@/components/client/categories/CategoryForm";
import { useToast } from "@/utils/toastUtils";
import { useAlert } from "@/utils/alertUtils";
import { useNotify } from "@/utils/notifyUtils";

export default function Categories() {
  const { categories, loading, addCategory, updateCategory, deleteCategory } = useCategories();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const toast = useToast();
  const alert = useAlert();
  const notify = useNotify();

  const handleSave = async (data) => {
    try {
      if (editing) {
        await updateCategory(editing.id, data);
        notify.success("Categoría actualizada", "Los cambios se guardaron correctamente");
      } else {
        await addCategory(data);
        notify.success("Categoría creada", "La categoría se agregó correctamente");
      }

      setOpen(false);
    } catch (err) {
      // 👇 aquí se muestra el mensaje del backend
      notify.error("Error al guardar", err.message || "No se pudo guardar la categoría");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await alert.confirm({
      title: "¿Eliminar categoría?",
      text: "Esta acción no se puede deshacer.",
    });
    if (!confirmed) return;

    try {
      await deleteCategory(id);
      notify.warning("Categoría eliminada", "El registro fue eliminado del sistema");
    } catch {
      notify.error("Error al eliminar", "No se pudo eliminar la categoría");
      toast.error("Error al eliminar la categoría");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Categorías</h2>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          Nueva Categoría
        </Button>
      </div>

      <CategoryTable
        categories={categories}
        loading={loading}
        onEdit={(c) => {
          setEditing(c);
          setOpen(true);
        }}
        onDelete={handleDelete}
      />

      <CategoryForm
        open={open}
        onClose={() => setOpen(false)}
        onSave={handleSave}
        category={editing}
      />
    </div>
  );
}
