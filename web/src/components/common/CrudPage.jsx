import { useState } from "react";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useToast } from "../../utils/toastUtils";
import { useAlert } from "../../utils/alertUtils";
import { useNotify } from "../../utils/notifyUtils";

/**
 * Componente CRUD genérico para páginas que siguen el mismo patrón.
 * 
 * Ejemplo de uso:
 * <CrudPage
 *   title="Usuarios"
 *   singular="usuario"
 *   plural="usuarios"
 *   dataKey="users"
 *   useEntityHook={useUsers}
 *   TableComponent={UserTable}
 *   FormComponent={UserForm}
 * />
 */
export default function CrudPage({
  title,
  singular,
  plural,
  dataKey,
  useEntityHook,
  TableComponent,
  FormComponent,
}) {
  // 🪝 Hook dinámico
  const hook = useEntityHook();
  const data = hook[dataKey] || []; // Ej: users o products
  const loading = hook.loading || false;

  // Determinar nombres de funciones disponibles
  const createFn = hook.createUser || hook.addProduct || hook.create || hook.add;
  const updateFn = hook.updateUser || hook.updateProduct || hook.update || hook.edit;
  const deleteFn = hook.deleteUser || hook.deleteProduct || hook.remove || hook.destroy;
  const toggleFn = hook.toggleUserStatus || hook.toggleProductStatus || hook.toggleStatus;

  // 🎛️ Estados
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // 🧩 Utils
  const toast = useToast();
  const alert = useAlert();
  const notify = useNotify();

  // 💾 Guardar / actualizar
  const handleSave = async (values) => {
    try {
      if (editing) {
        await updateFn(editing.id, values);
        notify.success(
          `${capitalize(singular)} actualizado`,
          "Los cambios se guardaron correctamente"
        );
      } else {
        await createFn(values);
        notify.success(
          `${capitalize(singular)} creado`,
          `El ${singular} se agregó correctamente`
        );
      }
      setOpen(false);
    } catch {
      toast.error(`Error al guardar el ${singular}`);
    }
  };

  // 🗑️ Eliminar
  const handleDelete = async (id) => {
    const confirmed = await alert.confirm({
      title: `¿Eliminar ${singular}?`,
      text: "Esta acción no se puede deshacer.",
    });
    if (!confirmed) return;

    try {
      await deleteFn(id);
      notify.warning(
        `${capitalize(singular)} eliminado`,
        `El registro fue eliminado del sistema`
      );
    } catch {
      notify.error("Error al eliminar", `No se pudo eliminar el ${singular}`);
      toast.error(`Error al eliminar el ${singular}`);
    }
  };

  // 🔄 Cambiar estado
  const handleToggleStatus = async (item) => {
    const confirmed = await alert.confirm({
      title: item.is_active
        ? `¿Inhabilitar ${singular}?`
        : `¿Habilitar ${singular}?`,
      text: item.is_active
        ? `El ${singular} será inhabilitado.`
        : `El ${singular} será habilitado nuevamente.`,
    });
    if (!confirmed) return;

    try {
      await toggleFn(item.id, !item.is_active);
      notify.info(
        item.is_active
          ? `${capitalize(singular)} inhabilitado`
          : `${capitalize(singular)} habilitado`,
        item.is_active
          ? `El ${singular} fue desactivado correctamente`
          : `El ${singular} fue activado correctamente`
      );
    } catch {
      toast.error(`Error al cambiar el estado del ${singular}`);
    }
  };

  return (
    <div className="p-6">
      {/* 🔹 Encabezado */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          Nuevo {capitalize(singular)}
        </Button>
      </div>

      {/* 🧾 Tabla */}
      <TableComponent
        {...{
          [plural]: data,
          loading,
          onEdit: (item) => {
            setEditing(item);
            setOpen(true);
          },
          onDelete: handleDelete,
          onToggleStatus: handleToggleStatus,
        }}
      />

      {/* 📝 Formulario */}
      <FormComponent
        open={open}
        onClose={() => setOpen(false)}
        onSave={handleSave}
        {...{ [singular]: editing }}
      />
    </div>
  );
}

// Helper para mayúscula inicial
function capitalize(str = "") {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
