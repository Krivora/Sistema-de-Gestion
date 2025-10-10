import { useState, useMemo } from "react";
import { Button, MenuItem, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useBranchProducts } from "../hooks/useBranchProducts";
import { useBranches } from "../hooks/useBranches";
import BranchProductTable from "../components/branchProducts/BranchProductTable";
import BranchProductForm from "../components/branchProducts/BranchProductForm";
import { useToast } from "../utils/toastUtils";
import { useAlert } from "../utils/alertUtils";
import { useNotify } from "../utils/notifyUtils";

export default function BranchProducts() {
  const { branches } = useBranches(); // para filtro de sucursal
  const { items, loading, branchId, setBranchId, createItem, updateItem, deleteItem, toggleStatus } =
    useBranchProducts();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const toast = useToast();
  const alert = useAlert();
  const notify = useNotify();

  const activeBranches = useMemo(
    () => (branches || []).filter((b) => b.is_active),
    [branches]
  );

  const handleSave = async (data) => {
    try {
      if (editing) {
        await updateItem(editing.id, data);
        notify.success("Actualizado", "El registro fue actualizado correctamente");
      } else {
        await createItem(data);
        notify.success("Creado", "El registro fue creado correctamente");
      }
      setOpen(false);
    } catch {
      toast.error("Error al guardar");
    }
  };

  const handleDelete = async (id) => {
    const ok = await alert.confirm({
      title: "¿Eliminar relación producto-sucursal?",
      text: "Esta acción no se puede deshacer.",
    });
    if (!ok) return;
    try {
      await deleteItem(id);
      notify.warning("Eliminado", "La relación fue eliminada");
    } catch {
      toast.error("No se pudo eliminar");
    }
  };

  const handleToggle = async (row) => {
    const ok = await alert.confirm({
      title: row.is_active ? "¿Inhabilitar en esta sucursal?" : "¿Habilitar en esta sucursal?",
      text: row.is_active
        ? "El producto quedará inactivo en esta sucursal."
        : "El producto quedará activo en esta sucursal.",
    });
    if (!ok) return;
    try {
      await toggleStatus(row.id, !row.is_active);
      notify.info(row.is_active ? "Inhabilitado" : "Habilitado", "Estado actualizado");
    } catch {
      toast.error("No se pudo cambiar el estado");
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <h2 className="text-xl font-semibold">Productos por Sucursal</h2>

        <div className="flex gap-3 items-center">
          <TextField
            select
            size="small"
            label="Filtrar por sucursal"
            value={branchId || ""}
            onChange={(e) => setBranchId(e.target.value)}
            sx={{ minWidth: 260 }}
          >
            <MenuItem value="">Todas</MenuItem>
            {activeBranches.map((b) => (
              <MenuItem key={b.id} value={b.id}>
                {b.name} {b.code ? `(${b.code})` : ""}
              </MenuItem>
            ))}
          </TextField>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            Asignar producto
          </Button>
        </div>
      </div>

      <BranchProductTable
        items={items}
        loading={loading}
        onEdit={(row) => {
          setEditing(row);
          setOpen(true);
        }}
        onDelete={handleDelete}
        onToggleStatus={handleToggle}
      />

      <BranchProductForm
        open={open}
        onClose={() => setOpen(false)}
        onSave={handleSave}
        row={editing}
        // si tienes un branch ya seleccionado, lo pre-cargamos en el form
        defaultBranchId={branchId}
      />
    </div>
  );
}
