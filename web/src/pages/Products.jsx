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
  const { products, loading, addProduct, updateProduct, deleteProduct, toggleProductStatus } =
    useProducts();
  
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const toast = useToast();
  const alert = useAlert();
  const notify = useNotify();
  const handleSave = async (data) => {
    try {
      if (editing) {
        await updateProduct(editing.id, data);
        notify.success("Producto actualizado", "Los cambios se guardaron correctamente");
      } else {
        await addProduct(data);
        notify.success("Producto creado", "El producto se agregó correctamente");
      }
      setOpen(false);
    } catch {
      toast.error("Error al guardar el producto");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await alert.confirm({
      title: "¿Eliminar producto?",
      text: "Esta acción no se puede deshacer.",
    });
    if (!confirmed) return;

    try {
      await deleteProduct(id);
      notify.warning("Producto eliminado", "El registro fue eliminado del sistema");
    } catch {
      notify.error("Error al eliminar", "No se pudo eliminar el producto");
      toast.error("Error al eliminar el producto");
    }
  };

  const handleToggleStatus = async (product) => {
    const confirmed = await alert.confirm({
      title: product.is_active ? "¿Inhabilitar producto?" : "¿Habilitar producto?",
      text: product.is_active
        ? "El producto será inhabilitado y no se mostrará en los listados."
        : "El producto será habilitado nuevamente.",
    });
    if (!confirmed) return;

    try {
      await toggleProductStatus(product.id, !product.is_active);
      notify.info(
        product.is_active ? "Producto inhabilitado" : "Producto habilitado",
        product.is_active
          ? "El producto fue desactivado correctamente"
          : "El producto fue activado correctamente"
      );
    } catch {
      toast.error("Error al cambiar el estado del producto");
    }
  };


  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-full overflow-x-hidden">
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
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
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
