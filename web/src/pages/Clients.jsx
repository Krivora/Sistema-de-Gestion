import { useState } from "react";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useClients } from "../hooks/useClients";
import ClientTable from "../components/clients/ClientTable";
import ClientForm from "../components/clients/ClientForm";
import { useToast } from "../utils/toastUtils";
import { useAlert } from "../utils/alertUtils";
import { useNotify } from "../utils/notifyUtils";

export default function Clients() {
  const { clients, loading, createClient, updateClient, deleteClient, toggleClientStatus } = useClients();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const toast = useToast();
  const alert = useAlert();
  const notify = useNotify();

  const handleSave = async (data) => {
    try {
      if (editing) {
        await updateClient(editing.id, data);
        notify.success("Cliente actualizado", "Cambios guardados correctamente");
      } else {
        await createClient(data);
        notify.success("Cliente creado", "El cliente se agregó correctamente");
      }
      setOpen(false);
    } catch {
      toast.error("Error al guardar el cliente");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await alert.confirm({
      title: "¿Eliminar cliente?",
      text: "Esta acción no se puede deshacer.",
    });
    if (!confirmed) return;

    try {
      await deleteClient(id);
      notify.warning("Cliente eliminado", "El registro fue eliminado del sistema");
    } catch {
      notify.error("Error al eliminar", "No se pudo eliminar el cliente");
      toast.error("Error al eliminar el cliente");
    }
  };

  const handleToggleStatus = async (client) => {
    const confirmed = await alert.confirm({
      title: client.is_active ? "¿Desactivar cliente?" : "¿Activar cliente?",
      text: client.is_active
        ? "El cliente será desactivado y sus usuarios no podrán acceder."
        : "El cliente será reactivado nuevamente.",
    });
    if (!confirmed) return;

    try {
      await toggleClientStatus(client.id, !client.is_active);
      notify.info(
        client.is_active ? "Cliente desactivado" : "Cliente activado",
        client.is_active
          ? "El cliente ya no tiene acceso"
          : "El cliente fue reactivado correctamente"
      );
    } catch {
      toast.error("Error al cambiar el estado del cliente");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Clientes</h2>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          Nuevo Cliente
        </Button>
      </div>

      <ClientTable
        clients={clients}
        loading={loading}
        onEdit={(c) => {
          setEditing(c);
          setOpen(true);
        }}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />

      <ClientForm
        open={open}
        onClose={() => setOpen(false)}
        onSave={handleSave}
        client={editing}
      />
    </div>
  );
}
