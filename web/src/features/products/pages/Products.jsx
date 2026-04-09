import { useState, useCallback } from "react";
import AddIcon from "@mui/icons-material/Add";
import { useProducts } from "../hooks/useProducts";
import ProductTable from "../components/ProductTable";
import ProductForm from "../components/ProductForm";
import { useAlert } from "@core/utils/alerts/alertUtils";
import { useNotify } from "@core/utils/alerts/notifyUtils";
import PageHeader from "@core/components/common/PageHeader";

export default function Products() {
  const {
    products,
    loading,
    addProduct,
    updateProduct,
    activateProduct,
    deactivateProduct,
    deleteProduct,
  } = useProducts();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const alert = useAlert();
  const notify = useNotify();

  const openCreate = useCallback(() => {
    setEditing(null);
    setOpen(true);
  }, []);

  const openEdit = useCallback((product) => {
    setEditing(product);
    setOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setOpen(false);
    setEditing(null);
  }, []);

  const handleSave = useCallback(async (data) => {
    setSaving(true);
    try {
      if (editing) {
        await updateProduct(editing.id, data);
        notify.success("Producto actualizado", "Cambios guardados correctamente");
      } else {
        await addProduct(data);
        notify.success("Producto creado", "Agregado correctamente");
      }
      closeForm();
    } catch (err) {
      notify.error("Error al guardar", err.message || "Intenta de nuevo");
    } finally {
      setSaving(false);
    }
  }, [editing, addProduct, updateProduct, notify, closeForm]);

  const handleActivate = useCallback(async (id) => {
    const ok = await alert.confirm({
      title: "¿Activar producto?",
      text: "Reactivará su disponibilidad en sucursales.",
    });
    if (!ok) return;

    try {
      await activateProduct(id);
      notify.success("Producto activado");
    } catch (err) {
      notify.error("Error al activar", err.message);
    }
  }, [alert, activateProduct, notify]);

  const handleDeactivate = useCallback(async (id) => {
    const ok = await alert.confirm({
      title: "¿Desactivar producto?",
      text: "Se ocultará en el sistema y en sus sucursales.",
    });
    if (!ok) return;

    try {
      await deactivateProduct(id);
      notify.info("Producto desactivado");
    } catch (err) {
      notify.error("Error al desactivar", err.message);
    }
  }, [alert, deactivateProduct, notify]);

  const handleDelete = useCallback(async (product) => {
    const ok = await alert.confirm({
      title: `¿Eliminar "${product.name}"?`,
      text: "Esta acción no se puede deshacer.",
    });
    if (!ok) return;

    try {
      await deleteProduct(product.id);
      notify.warning("Producto eliminado");
    } catch (err) {
      notify.error("Error al eliminar", err.message);
    }
  }, [alert, deleteProduct, notify]);

  return (
    <div>
      <PageHeader
        title="Productos"
        description="Administra el catálogo de productos del inventario."
        actions={
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors"
            style={{ background: "var(--color-primary)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--color-primary-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "var(--color-primary)")
            }
          >
            <AddIcon sx={{ fontSize: 18 }} />
            Nuevo Producto
          </button>
        }
      />

      <ProductTable
        products={products}
        loading={loading}
        onEdit={openEdit}
        onActivate={handleActivate}
        onDeactivate={handleDeactivate}
        onDelete={handleDelete}
      />

      <ProductForm
        open={open}
        onClose={closeForm}
        onSave={handleSave}
        product={editing}
        saving={saving}
      />
    </div>
  );
}