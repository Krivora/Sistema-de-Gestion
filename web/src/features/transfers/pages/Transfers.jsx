import { useState } from "react";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useTransfers } from "../hooks/useTransfers";
import TransferTable from "../components/TransferTable";
import TransferForm from "../components/TransferForm";
import { useToast } from "@core/utils/alerts/toastUtils";
import { useNotify } from "@core/utils/alerts/notifyUtils";
import PageHeader from "@core/components/common/PageHeader";

export default function TransfersPage() {
  const { transfers, loading, createTransfer, fetchTransfers } = useTransfers();

  const [open, setOpen] = useState(false);
  const toast = useToast();
  const notify = useNotify();

  const handleSave = async (data) => {
    try {
      await createTransfer(data);
      notify.success("Transferencia registrada", "El movimiento fue creado correctamente");
      setOpen(false);
    } catch (err) {
      toast.error("Error al guardar la transferencia");
    }
  };

  return (
    <div className="p-6">
       <PageHeader
        title="Transferencias"
        description="Administra las transferencias de productos entre sucursales o almacenes, manteniendo trazabilidad completa de los movimientos de entrada y salida."
      />
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
        >
          Nueva Transferencia
        </Button>
      </div>

      <TransferTable transfers={transfers} loading={loading} />

      <TransferForm
        open={open}
        onClose={() => setOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
