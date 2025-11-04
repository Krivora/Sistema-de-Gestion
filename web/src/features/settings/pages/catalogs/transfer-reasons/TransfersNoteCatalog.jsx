import { useCatalog } from "@features/settings/hooks/useCatalogs";
import { useState, useMemo } from "react";
import {
  Button,
  Tabs,
  Tab,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import TransfersNoteForm from "./TransfersNoteForm";
import TransfersNoteTable from "./TransfersNoteTable";
import { useToast } from "@core/utils/alerts/toastUtils";
import { useAlert } from "@core/utils/alerts/alertUtils";
import { useNotify } from "@core/utils/alerts/notifyUtils";
import PageHeader from "@core/components/common/PageHeader";
import { useTheme } from "@core/context/ThemeProvider";

export default function TransfersNoteCatalog() {
  const { items, loading, createItem, deleteItem, restoreItem } = useCatalog("transfer_reasons");
  const { darkMode } = useTheme();
  const [status, setStatus] = useState("active"); // active | inactive
  const [open, setOpen] = useState(false);
  const toast = useToast();
  const alert = useAlert();
  const notify = useNotify();

  // 📊 Filtrado por tab (activos / eliminados)
  const filteredItems = useMemo(() => {
    return status === "active"
      ? items.filter((i) => !i.deleted_at)
      : items.filter((i) => i.deleted_at);
  }, [items, status]);

  // 🗑️ Confirmar eliminación
  const handleDelete = async (item) => {
    const confirmed = await alert.confirm({
      title: "¿Eliminar motivo?",
      text: "El motivo se marcará como eliminado, pero podrás restaurarlo más tarde.",
    });
    if (!confirmed) return;

    try {
      await deleteItem(item.id);
      notify.warning("Motivo eliminado", "El motivo fue desactivado correctamente");
    } catch {
      toast.error("Error al eliminar el motivo");
    }
  };

  // ♻️ Confirmar restauración
  const handleRestore = async (item) => {
    const confirmed = await alert.confirm({
      title: "¿Restaurar motivo?",
      text: "El motivo volverá a estar disponible para su uso.",
    });
    if (!confirmed) return;

    try {
      await restoreItem(item.id);
      notify.success("Motivo restaurado", "El motivo fue reactivado correctamente");
    } catch {
      toast.error("Error al restaurar el motivo");
    }
  };

  // ➕ Crear nuevo motivo
  const handleAdd = async (data) => {
    try {
      await createItem(data);
      notify.success("Motivo agregado", "El motivo de transferencia fue creado correctamente");
    } catch {
      toast.error("Error al crear el motivo");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Motivos de Transferencia"
        description="Define los motivos utilizados para registrar transferencias entre sucursales o almacenes."
        breadcrumbs={[
          { label: "Configuración", to: "/config" },
          { label: "Catálogos", to: "/settings/catalogs" },
          { label: "Motivos de Transferencia" },
        ]}
      />
      <div className="flex justify-between items-center">
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
        >
          Nuevo Motivo
        </Button>
      </div>

      {/* 🔹 Tabs: activos / eliminados */}
      <Tabs
        value={status}
        onChange={(e, val) => setStatus(val)}
        className="mb-2"
      >
        <Tab label="Activos" value="active" />
        <Tab label="Eliminados" value="inactive" />
      </Tabs>

      {/* 🧾 Tabla */}
      <TransfersNoteTable
        items={filteredItems}
        loading={loading}
        darkMode={darkMode}
        deleteItem={handleDelete}
        restoreItem={handleRestore}
      />

      {/* 🧩 Formulario */}
      {open && (
        <div className="mt-4">
          <TransfersNoteForm createItem={handleAdd} />
          <div className="flex justify-end mt-2">
            <Button onClick={() => setOpen(false)}>Cerrar</Button>
          </div>
        </div>
      )}
    </div>
  );
}
