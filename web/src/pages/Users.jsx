import { useState } from "react";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useUsers } from "../hooks/useUsers";
import UserTable from "../components/users/UserTable";
import UserForm from "../components/users/UserForm";
import { useToast } from "../utils/toastUtils";
import { useAlert } from "../utils/alertUtils";
import { useNotify } from "../utils/notifyUtils";

export default function Users() {
  const { users, loading, createUser, updateUser, deleteUser, toggleUserStatus } = useUsers(); // 👈 agregamos toggle
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
    } catch {
      toast.error("Error al guardar el usuario");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await alert.confirm({
      title: "¿Eliminar usuario?",
      text: "Esta acción no se puede deshacer.",
    });
    if (!confirmed) return;

    try {
      await deleteUser(id);
      notify.warning("Usuario eliminado", "El registro fue eliminado del sistema");
    } catch {
      notify.error("Error al eliminar", "No se pudo eliminar el usuario");
      toast.error("Error al eliminar el usuario");
    }
  };

  const handleToggleStatus = async (user) => {
    const confirmed = await alert.confirm({
      title: user.is_active ? "¿Inhabilitar usuario?" : "¿Habilitar usuario?",
      text: user.is_active
        ? "El usuario será inhabilitado y no podrá acceder al sistema."
        : "El usuario será reactivado y podrá acceder nuevamente.",
    });
    if (!confirmed) return;

    try {
      await toggleUserStatus(user.id, !user.is_active);
      notify.info(
        user.is_active ? "Usuario inhabilitado" : "Usuario habilitado",
        user.is_active
          ? "El usuario ya no puede acceder al sistema"
          : "El usuario fue reactivado correctamente"
      );
    } catch {
      toast.error("Error al cambiar el estado del usuario");
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

      <UserTable
        users={users}
        loading={loading}
        onEdit={(u) => {
          setEditing(u);
          setOpen(true);
        }}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus} // 👈 se pasa la función
      />

      <UserForm
        open={open}
        onClose={() => setOpen(false)}
        onSave={handleSave}
        user={editing}
      />
    </div>
  );
}
