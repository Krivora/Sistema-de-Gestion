import { useState } from "react";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useBranches } from "@/hooks/useBranches";
import BranchTable from "@/components/client/branches/BranchTable";
import BranchForm from "@/components/client/branches/BranchForm";
import { useToast } from "@/utils/toastUtils";
import { useAlert } from "@/utils/alertUtils";
import { useNotify } from "@/utils/notifyUtils";

export default function Branches() {
  const { branches, loading, addBranch, updateBranch, deleteBranch, toggleBranchStatus } =
    useBranches();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const toast = useToast();
  const alert = useAlert();
  const notify = useNotify();

  const handleSave = async (data) => {
    try {
      if (editing) {
        await updateBranch(editing.id, data);
        notify.success("Sucursal actualizada", "Los cambios se guardaron correctamente");
      } else {
        await addBranch(data);
        notify.success("Sucursal creada", "La sucursal se agregó correctamente");
      }
      setOpen(false);
    } catch {
      toast.error("Error al guardar la sucursal");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await alert.confirm({
      title: "¿Eliminar sucursal?",
      text: "Esta acción no se puede deshacer.",
    });
    if (!confirmed) return;

    try {
      await deleteBranch(id);
      notify.warning("Sucursal eliminada", "El registro fue eliminado del sistema");
    } catch {
      notify.error("Error al eliminar", "No se pudo eliminar la sucursal");
      toast.error("Error al eliminar la sucursal");
    }
  };

  const handleToggleStatus = async (branch) => {
    const confirmed = await alert.confirm({
      title: branch.is_active ? "¿Inhabilitar sucursal?" : "¿Habilitar sucursal?",
      text: branch.is_active
        ? "La sucursal será inhabilitada temporalmente."
        : "La sucursal será habilitada nuevamente.",
    });
    if (!confirmed) return;

    try {
      await toggleBranchStatus(branch.id, !branch.is_active);
      notify.info(
        branch.is_active ? "Sucursal inhabilitada" : "Sucursal habilitada",
        branch.is_active
          ? "La sucursal fue desactivada correctamente"
          : "La sucursal fue activada correctamente"
      );
    } catch {
      toast.error("Error al cambiar el estado de la sucursal");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Sucursales</h2>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          Nueva Sucursal
        </Button>
      </div>

      <BranchTable
        branches={branches}
        loading={loading}
        onEdit={(b) => {
          setEditing(b);
          setOpen(true);
        }}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />

      <BranchForm
        open={open}
        onClose={() => setOpen(false)}
        onSave={handleSave}
        branch={editing}
      />
    </div>
  );
}
