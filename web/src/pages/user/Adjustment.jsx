import { useState } from "react";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useTransfers } from "@/hooks/useTransfers";
import TransferTable from "@/components/client/transfers/TransferTable";
import TransferForm from "@/components/client/transfers/TransferForm";
import { useToast } from "@/utils/toastUtils";
import { useNotify } from "@/utils/notifyUtils";

export default function AdjustmentPage() {
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Ajustes de Inventario</h2>
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
