import { useState } from "react";
import { Button} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useBranches } from "../hooks/useBranches";
import BranchTable from "../components/BranchTable";
import BranchForm from "../components/BranchForm";
import { useToast } from "@core/utils/alerts/toastUtils";
import { useAlert } from "@core/utils/alerts/alertUtils";
import { useNotify } from "@core/utils/alerts/notifyUtils";
import PageHeader from "@core/components/common/PageHeader";

export default function Branches() {
  const { branches, loading, addBranch, updateBranch, deleteBranch } =
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
    } catch (err) {
      // 👇 Capturamos el mensaje exacto del backend
      const errorMsg =
        err?.message ||
        err?.response?.data?.error || // si usas fetch o axios, puede venir así
        "Error al guardar la sucursal";

      // 👇 Mostrarlo bonito en pantalla
      notify.error("No se pudo crear la sucursal", errorMsg);
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

  return (
    <div className="p-6">
      <PageHeader
        title="Sucursales"
        description="Administra las diferentes sucursales en el sistema"
      />
      <div className="flex justify-start items-center mb-4 mt-3">
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
