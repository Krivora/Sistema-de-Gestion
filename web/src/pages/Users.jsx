import { useState } from "react";
import { Button, Tabs, Tab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useUsers } from "@/hooks/useUsers";
import UserTable from "@/components/client/users/UserTable";
import UserForm from "@/components/client/users/UserForm";
import { useToast } from "@/utils/toastUtils";
import { useAlert } from "@/utils/alertUtils";
import { useNotify } from "@/utils/notifyUtils";

export default function Users() {
  const {
    users,
    loading,
    createUser,
    updateUser,
    desactiveUser,
    deleteUser,
    status,
    setStatus,
  } = useUsers();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const toast = useToast();
  const alert = useAlert();
  const notify = useNotify();

  const handleSave = async (data) => {
    try {
      if (editing) {
        await updateUser(editing.id, data);
        notify.success("Usuario actualizado", "Los cambios se guardaron correctamente");
      } else {
        await createUser(data);
        notify.success("Usuario creado", "El usuario se agregó correctamente");
      }
      setOpen(false);
    } catch (err) {
      const errorMsg =
        err?.message ||
        err?.response?.data?.error ||
        "Error al guardar el usuario";
      notify.error("No se pudo guardar el usuario", errorMsg);
    }
  };

  const handleDesactivate = async (user) => {
    const confirmed = await alert.confirm({
      title: "¿Desactivar usuario?",
      text: "El usuario será inhabilitado y no podrá acceder al sistema.",
    });
    if (!confirmed) return;

    try {
      await desactiveUser(user.id);
      notify.info("Usuario desactivado", "El usuario ya no puede acceder al sistema");
    } catch {
      toast.error("Error al desactivar el usuario");
    }
  };

  const handleDelete = async (user) => {
    const confirmed = await alert.confirm({
      title: "¿Eliminar usuario?",
      text: "El usuario será eliminado completamente.",
    });
    if (!confirmed) return;

    try {
      await deleteUser(user.id);
      notify.warning("Usuario eliminado", "El usuario fue eliminado correctamente");
    } catch {
      toast.error("Error al eliminar el usuario");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Usuarios</h2>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          Nuevo Usuario
        </Button>
      </div>

      {/* 🔹 Tabs de filtro */}
      <Tabs
        value={status}
        onChange={(e, newValue) => setStatus(newValue)}
        className="mb-4"
      >
        <Tab label="En funcion" value="active" />
        <Tab label="Inactivos" value="inactive" />
      </Tabs>

      {/* 🔹 Tabla */}
      <UserTable
        users={users}
        loading={loading}
        status={status}
        onEdit={(u) => {
          setEditing(u);
          setOpen(true);
        }}
        onDesactivate={handleDesactivate}
        onDelete={handleDelete}
      />

      {/* 🔹 Formulario */}
      <UserForm
        open={open}
        onClose={() => setOpen(false)}
        onSave={handleSave}
        user={editing}
      />
    </div>
  );
}
