import { useState } from "react";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useTransfers } from "../hooks/useTransfers";
import TransferDetails from "../components/TransferDetails";
import TransferTable from "../components/TransferTable";
import TransferForm from "../components/TransferForm";
import { useToast } from "@core/utils/alerts/toastUtils";
import { useNotify } from "@core/utils/alerts/notifyUtils";
import PageHeader from "@core/components/common/PageHeader";

export default function TransfersPage() {
  const { transfers, loading, createTransfer, getTransfer } = useTransfers();
  const [open, setOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState(null);

  const toast = useToast();
  const notify = useNotify();

  // 💾 Guardar transferencia
  const handleSave = async (data) => {
    try {
      await createTransfer(data);
      notify.success("Transferencia registrada", "El movimiento fue creado correctamente");
      setOpen(false);
    } catch (err) {
      toast.error(err.message || "Error al guardar la transferencia");
    }
  };

  // 🔍 Ver detalles
  const handleView = async (transfer) => {
    try {
      const full = await getTransfer(transfer.id);
      setSelectedTransfer(full);
      setDetailOpen(true);
    } catch (err) {
      toast.error("Error al obtener detalles de la transferencia");
    }
  };

  return (
    <div className="p-6 space-y-4">
      <PageHeader
        title="Transferencias"
        description="Administra las transferencias de productos entre sucursales o almacenes, manteniendo trazabilidad completa de los movimientos de entrada y salida."
      />

      <div className="flex justify-between items-center mb-4">
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
          Nueva Transferencia
        </Button>
      </div>

      <TransferTable
        transfers={transfers}
        loading={loading}
        onView={handleView} // 👈 pasamos la acción de ver detalles
      />

      <TransferForm
        open={open}
        onClose={() => setOpen(false)}
        onSave={handleSave}
      />

      <TransferDetails
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        transfer={selectedTransfer}
      />
    </div>
  );
}
