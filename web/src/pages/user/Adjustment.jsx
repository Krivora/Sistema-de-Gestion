import { useState } from "react";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useAdjustments } from "@/hooks/useAdjustments";
import { AdjustmentsApi } from "@/api/adjustments";
import AdjustmentTable from "@/components/client/adjustments/AdjustmentTable";
import AdjustmentForm from "@/components/client/adjustments/AdjustmentForm";
import AdjustmentDetails from "@/components/client/adjustments/AdjustmentDetails";
import { useToast } from "@/utils/toastUtils";
import { useNotify } from "@/utils/notifyUtils";

export default function Adjustments() {
  const { adjustments, loading, createAdjustment } = useAdjustments();
  const [open, setOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] = useState(null);
  const toast = useToast();
  const notify = useNotify();

  const handleSave = async (data) => {
    try {
      await createAdjustment(data);
      notify.success("Ajuste creado", "El ajuste se registró correctamente");
      setOpen(false);
    } catch {
      toast.error("Error al guardar el ajuste");
    }
  };

  const handleView = async (adjustment) => {
    try {
      const full = await AdjustmentsApi.get(adjustment.id);
      setSelectedAdjustment(full.data || full);
      setDetailOpen(true);
    } catch {
      toast.error("Error al obtener detalles del ajuste");
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Ajustes de Inventario</h2>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
          Nuevo Ajuste
        </Button>
      </div>

      <AdjustmentTable adjustments={adjustments} loading={loading} onView={handleView} />

      <AdjustmentForm open={open} onClose={() => setOpen(false)} onSave={handleSave} />

      <AdjustmentDetails
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        adjustment={selectedAdjustment}
      />
    </div>
  );
}
