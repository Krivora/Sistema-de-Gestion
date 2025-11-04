import { useState } from "react";
import { Button, } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useAdjustments } from "../hooks/useAdjustments";
import { AdjustmentsApi } from "../api/adjustments";
import AdjustmentTable from "../components/AdjustmentTable";
import AdjustmentForm from "../components/AdjustmentForm";
import AdjustmentDetails from "../components/AdjustmentDetails";
import { useToast } from "@core/utils/alerts/toastUtils";
import { useNotify } from "@core/utils/alerts/notifyUtils";
import PageHeader from "@core/components/common/PageHeader";
export default function Adjustments() {
  const { adjustments, loading, createAdjustment } = useAdjustments();
  const [open, setOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] = useState(null);
  const toast = useToast();
  const notify = useNotify();
  const handleSave = async (data) => {
    console.log(data)
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
      <PageHeader
        title=" Ajustes de Inventario"
        description="Controla las correcciones de inventario por diferencias físicas, devoluciones, pérdidas o ajustes administrativos registrados en el sistema."
      />
      <div className="flex justify-between items-center mb-4">
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
