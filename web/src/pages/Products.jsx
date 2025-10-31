import { useState } from "react";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useProducts } from "@/hooks/useProducts";
import ProductTable from "@/components/client/products/ProductTable";
import ProductForm from "@/components/client/products/ProductForm";
import { useToast } from "@/utils/toastUtils";
import { useAlert } from "@/utils/alertUtils";
import { useNotify } from "@/utils/notifyUtils";

export default function Products() {
  const {
    products,
    loading,
    addProduct,
    updateProduct,
    activateProduct,
    desactivateProduct,
    deleteProduct,
  } = useProducts();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const toast = useToast();
  const alert = useAlert();
  const notify = useNotify();

  const handleSave = async (data) => {
    try {
      if (editing) {
        await updateProduct(editing.id, data);
        notify.success("Producto actualizado", "Cambios guardados correctamente");
      } else {
        await addProduct(data);
        notify.success("Producto creado", "Agregado correctamente");
      }
      setOpen(false);
    } catch {
      toast.error("Error al guardar el producto");
    }
  };

  const handleActivate = async (id) => {
    const confirmed = await alert.confirm({
      title: "¿Activar producto?",
      text: "Esto reactivará también su disponibilidad en sucursales.",
    });
    if (!confirmed) return;

    try {
      const message = await activateProduct(id);
      notify.success("Producto activado", message);
    } catch (err) {
      notify.error("Error al activar", err.message || "No se pudo activar el producto");
    }
  };

  const handleDesactivate = async (id) => {
    const confirmed = await alert.confirm({
      title: "¿Desactivar producto?",
      text: "Esto ocultará el producto en el sistema y en sus sucursales.",
    });
    if (!confirmed) return;

    try {
      const message = await desactivateProduct(id);
      notify.info("Producto desactivado", message);
    } catch (err) {
      notify.error("Error al desactivar", err.message || "No se pudo desactivar el producto");
    }
  };

  const handleDelete = async (product) => {
    const confirmed = await alert.confirm({
       title: `¿Eliminar el producto ${product.name}?`,
      text: "Esto eliminara el producto completamente. Esta acción no se puede deshacer",
    });
    if (!confirmed) return;

    try {
      const message = await deleteProduct(id);
      notify.warning("Producto eliminado", message);
    } catch (err) {
      notify.error("Error al eliminar", err.message || "No se pudo eliminar el producto");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Productos</h2>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          Nuevo Producto
        </Button>
      </div>

      <ProductTable
        products={products}
        loading={loading}
        onEdit={(p) => {
          setEditing(p);
          setOpen(true);
        }}
        onActivate={handleActivate}
        onDesactivate={handleDesactivate}
        onDelete={handleDelete}
      />

      <ProductForm
        open={open}
        onClose={() => setOpen(false)}
        onSave={handleSave}
        product={editing}
      />
    </div>
  );
}
